import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L, { type LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import addressService from '../../services/addressService';
import toast from 'react-hot-toast';
import type { Address } from '../../models/Address';

type LatLng = { lat: number; lng: number } | null;

interface Props {
  mode?: 'create' | 'edit';
  userId?: number; // required for create
  addressId?: number; // required for edit
  initial?: Partial<Address>;
  onSaved?: (a: Address) => void;
  onCancel?: () => void;
}

function ClickHandler({
  setPosition,
  setStreet,
  setNumber,
  setStreetType,
  setGeocodingLoading,
}: {
  setPosition: (p: LatLng) => void;
  setStreet: (s: string) => void;
  setNumber: (n: string) => void;
  setStreetType: (t: string) => void;
  setGeocodingLoading: (b: boolean) => void;
}) {
  useMapEvents({
    async click(e: LeafletMouseEvent) {
      const latlng = e.latlng;
      setPosition(latlng);
      setGeocodingLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
          latlng.lat,
        )}&lon=${encodeURIComponent(latlng.lng)}&addressdetails=1`;
        const resp = await fetch(url, { headers: { 'Accept-Language': 'es' } });
        if (!resp.ok) throw new Error('Reverse geocoding failed');
        const data = await resp.json();
        const addr = (data && data.address) || {};

        let road = (addr.road || addr.pedestrian || addr.cycleway || addr.footway || addr.path || addr.neighbourhood || addr.suburb || '') as string;
        let houseNumber = (addr.house_number || addr.house || addr.building || addr.housenumber || '') as string;

        if (!houseNumber && data && data.display_name) {
          const dn = String(data.display_name);
          const hashMatch = dn.match(/#\s*([0-9A-Za-z\-]+)/);
          const noMatch = dn.match(/\bNo\.?\s*[:#]?\s*([0-9A-Za-z\-]+)/i);
          const dashMatch = dn.match(/\b([0-9]{1,4}-[0-9]{1,4})\b/);
          if (hashMatch) houseNumber = hashMatch[1];
          else if (noMatch) houseNumber = noMatch[1];
          else if (dashMatch) houseNumber = dashMatch[1];
        }

        if (!houseNumber && road) {
          const rd = String(road);
          const hashMatchR = rd.match(/#\s*([0-9A-Za-z\-]+)/);
          const dashMatchR = rd.match(/([0-9]{1,4}-[0-9]{1,4})/);
          if (hashMatchR) houseNumber = hashMatchR[1];
          else if (dashMatchR) houseNumber = dashMatchR[1];
        }

        const knownTypes: Record<string, string> = {
          cl: 'Calle',
          cll: 'Calle',
          calle: 'Calle',
          cra: 'Carrera',
          cr: 'Carrera',
          craa: 'Carrera',
          carrera: 'Carrera',
          av: 'Avenida',
          avd: 'Avenida',
          avenida: 'Avenida',
          tv: 'Transversal',
          transversal: 'Transversal',
          diag: 'Diagonal',
          diagonal: 'Diagonal',
          kr: 'Carrera',
        };

        let detectedType = 'Calle';
        let streetName = road;
        if (road) {
          const r = road.trim();
          const m = r.match(/^([A-Za-zÀ-ÿ\.]+)\s+(.+)$/);
          if (m) {
            const maybeType = m[1].replace('.', '').toLowerCase();
            const rest = m[2];
            if (knownTypes[maybeType]) {
              detectedType = knownTypes[maybeType];
              streetName = rest;
            } else {
              streetName = r;
            }
          } else {
            streetName = r;
          }
        }

        setStreetType(detectedType);
        setStreet(streetName || '');
        setNumber(houseNumber || '');
      } catch (err) {
        console.error('Reverse geocoding error', err);
        toast.error('No se pudo obtener la dirección desde el mapa');
      } finally {
        setGeocodingLoading(false);
      }
    },
  });
  return null;
}

const GenericAddressForm: React.FC<Props> = ({ mode = 'create', userId, addressId, initial, onSaved, onCancel }) => {
  const [street, setStreet] = useState(initial?.street?.replace(/^\w+\s+/, '') || '');
  const [streetType, setStreetType] = useState<string>((initial?.street && initial.street.split(' ')[0]) || 'Calle');
  const [number, setNumber] = useState(initial?.number || '');
  const [position, setPosition] = useState<LatLng>(
    initial && initial.latitude !== undefined && initial.longitude !== undefined
      ? { lat: Number(initial.latitude), lng: Number(initial.longitude) }
      : null,
  );
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = React.useRef<number | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const defaultCenter = { lat: 5.0689, lng: -75.5176 };

  useEffect(() => {
    if (mode === 'edit' && addressId) {
      (async () => {
        try {
          const a = await addressService.getAddressById(addressId);
          if (a) {
            // map back
            const parts = (a.street || '').split(' ');
            if (parts.length > 1) {
              setStreetType(parts[0]);
              setStreet(parts.slice(1).join(' '));
            } else {
              setStreet(a.street || '');
            }
            setNumber(a.number || '');
            setPosition({ lat: a.latitude || 0, lng: a.longitude || 0 });
          }
        } catch (err) {
          console.error('Error loading address for edit', err);
        }
      })();
    }
  }, [mode, addressId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'create' && !userId) {
      toast.error('userId requerido para crear dirección');
      return;
    }
    if (!street || !number) {
      toast.error('Street y Number son obligatorios');
      return;
    }
    if (!position) {
      toast.error('Seleccione una ubicación en el mapa (clic).');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        street: `${streetType} ${street}`,
        number,
        latitude: position.lat,
        longitude: position.lng,
      } as Omit<Address, 'id'>;
      let saved: Address | null = null;
      if (mode === 'create') {
        saved = await addressService.createAddress(userId as number, payload);
      } else {
        if (!addressId) throw new Error('addressId requerido para actualizar');
        saved = await addressService.updateAddress(addressId, payload as Partial<Address>);
      }
      if (saved) {
        toast.success('Dirección guardada');
        onSaved && onSaved(saved);
      }
    } catch (err) {
      console.error('Save address error', err);
      toast.error('Error al guardar la dirección');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-geocode when street or number change (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // if no meaningful input, skip
    if (!street || !number) return;

    debounceRef.current = window.setTimeout(async () => {
      setGeocodingLoading(true);
      // abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        const query = `${streetType} ${street} ${number} Manizales Colombia`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
        const resp = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'es' } });
        if (!resp.ok) throw new Error('Geocoding failed');
        const results = await resp.json();
        if (Array.isArray(results) && results.length > 0) {
          const r = results[0];
          const lat = Number(r.lat);
          const lon = Number(r.lon);
          setPosition({ lat, lng: lon });
        } else {
          toast.error('No se encontró la dirección en el mapa');
        }
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Geocoding error', err);
        }
      } finally {
        setGeocodingLoading(false);
        abortControllerRef.current = null;
      }
    }, 700);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [street, number, streetType]);

  // Manual geocode trigger
  const geocodeNow = async () => {
    if (!street || !number) {
      toast.error('Street y Number son obligatorios para buscar');
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setGeocodingLoading(true);
    try {
      const query = `${streetType} ${street} ${number} Manizales Colombia`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const resp = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'es' } });
      if (!resp.ok) throw new Error('Geocoding failed');
      const results = await resp.json();
      if (Array.isArray(results) && results.length > 0) {
        const r = results[0];
        setPosition({ lat: Number(r.lat), lng: Number(r.lon) });
      } else {
        toast.error('No se encontró la dirección en el mapa');
      }
    } catch (err) {
      if ((err as any).name !== 'AbortError') {
        console.error('Geocoding error', err);
        toast.error('Error al buscar la dirección');
      }
    } finally {
      setGeocodingLoading(false);
      abortControllerRef.current = null;
    }
  };

  const locationIcon = L.divIcon({
    className: 'custom-location-icon',
    html: `<svg width="36" height="48" viewBox="0 0 24 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C7.02944 0 3 4.02944 3 9C3 16.125 12 33 12 33C12 33 21 16.125 21 9C21 4.02944 16.9706 0 12 0Z" fill="#ef4444"/><circle cx="12" cy="9" r="3.5" fill="white"/></svg>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  });

  function Recenter({ pos }: { pos: LatLng }) {
    const map = useMap();
    useEffect(() => {
      if (pos) map.setView(pos, map.getZoom());
    }, [pos, map]);
    return null;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 rounded border bg-white p-4">
          <div style={{ height: 360 }} className="rounded overflow-hidden">
            {/* @ts-ignore */}
            <MapContainer center={position ?? defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              {/* @ts-ignore */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler
                setPosition={setPosition}
                setStreet={setStreet}
                setNumber={setNumber}
                setStreetType={setStreetType}
                setGeocodingLoading={setGeocodingLoading}
              />
              {/* @ts-ignore */}
              {position && <Marker position={position} icon={locationIcon} />}
              {position && <Recenter pos={position} />}
            </MapContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 rounded border bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de vía</label>
              <select className="w-full border rounded px-3 py-2 mb-2" value={streetType} onChange={(e) => setStreetType(e.target.value)}>
                <option value="Calle">Calle</option>
                <option value="Carrera">Carrera</option>
                <option value="Avenida">Avenida</option>
                <option value="Transversal">Transversal</option>
                <option value="Diagonal">Diagonal</option>
              </select>

              <label className="block text-sm font-medium mb-1">Street (nombre de la vía)</label>
              <input className="w-full border rounded px-3 py-2" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Ej: 23A, 24, or Nombre de la vía" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number</label>
              <input className="w-full border rounded px-3 py-2" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Enter number" />

              <div className="mt-2">
                <button type="button" onClick={geocodeNow} className="inline-block rounded-md bg-secondary px-4 py-1 text-white hover:opacity-90 disabled:opacity-60" disabled={geocodingLoading}>
                  {geocodingLoading ? 'Buscando...' : 'Buscar en mapa'}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Lat / Lng: {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : 'No seleccionado'}</p>
              {geocodingLoading && <p className="text-sm text-gray-600">Buscando dirección...</p>}
            </div>

            <div className="pt-4 flex gap-2">
              <button type="submit" disabled={submitting} className="inline-block rounded-md bg-primary px-6 py-2 text-white hover:opacity-90 disabled:opacity-60">
                {submitting ? (mode === 'create' ? 'Creando...' : 'Guardando...') : (mode === 'create' ? 'Create' : 'Save')}
              </button>
              {onCancel && (
                <button type="button" onClick={onCancel} className="inline-block rounded-md border px-6 py-2">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenericAddressForm;
