import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import addressService from '../../services/addressService';
import toast from 'react-hot-toast';
import type { Address } from '../../models/Address';

// Evitar cargar Google Maps múltiples veces (StrictMode monta efectos 2 veces en dev)
let googleMapsLoaderPromise: Promise<boolean> | null = null;

// Tipado de coordenadas usado en el formulario
type LatLng = { lat: number; lng: number } | null;

// Props del componente (se mantienen igual para reusar en las páginas existentes)
interface Props {
  mode?: 'create' | 'edit';
  userId?: number; // requerido para crear
  addressId?: number; // requerido para editar
  initial?: Partial<Address>;
  onSaved?: (a: Address) => void;
  onCancel?: () => void;
  // Opcional: permitir usar Google Maps en vez de Leaflet
  mapProvider?: 'leaflet' | 'google';
}

// FIX: Leaflet en Vite no resuelve los iconos por defecto; forzamos URLs públicas
// para que el marcador se vea sin configurar loaders especiales.
// Esto NO toca el backend, es puramente del lado del cliente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GenericAddressForm: React.FC<Props> = ({
  mode = 'create',
  userId,
  addressId,
  initial,
  onSaved,
  onCancel,
  mapProvider = 'leaflet',
}) => {
  // Refs de Leaflet: mapa, marcador y contenedor DOM
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Estado para saber cuándo Leaflet terminó de inicializarse
  const [leafletReady, setLeafletReady] = useState(false);

  // Refs de Google Maps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMarkerRef = useRef<any>(null);

  // Estado del formulario
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
  const debounceRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Flag para indicar si Google Maps no pudo inicializar (clave faltante o error de red)
  const [googleInitFailed, setGoogleInitFailed] = useState(false);
  // Proveedor efectivo: puede caer a Leaflet si Google falla (sin bloquear al usuario)
  const [effectiveProvider, setEffectiveProvider] = useState<'leaflet' | 'google'>(mapProvider);
  useEffect(() => { setEffectiveProvider(mapProvider); }, [mapProvider]);

  // Centro por defecto (Manizales)
  const defaultCenter = { lat: 5.0689, lng: -75.5176 };

  // Icono de marcador bonito (SVG) para la ubicación
  const locationIcon = L.divIcon({
    className: 'custom-location-icon',
    html: `<svg width="36" height="48" viewBox="0 0 24 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C7.02944 0 3 4.02944 3 9C3 16.125 12 33 12 33C12 33 21 16.125 21 9C21 4.02944 16.9706 0 12 0Z" fill="#ef4444"/><circle cx="12" cy="9" r="3.5" fill="white"/></svg>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  });

  // Cargar Google Maps si se elige ese proveedor
  const loadGoogleMaps = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    if (w.google && w.google.maps) return true; // ya disponible
    if (googleMapsLoaderPromise) return googleMapsLoaderPromise; // ya en proceso de carga
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('VITE_GOOGLE_MAPS_API_KEY no definido');
      return false;
    }
    googleMapsLoaderPromise = new Promise((resolve) => {
      const existing = document.getElementById('google-maps-script') as HTMLScriptElement | null;
      if (existing) {
        // Si el script ya existe, esperamos a que "google.maps" esté disponible
        const check = () => {
          if (w.google && w.google.maps) resolve(true);
          else setTimeout(check, 50);
        };
        check();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Google recomienda usar loading=async para mejor rendimiento
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
    return googleMapsLoaderPromise;
  };

  // 1) Inicializar el mapa (Leaflet o Google) una sola vez según el proveedor efectivo
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Google Maps
    if (effectiveProvider === 'google') {
      if (googleMapRef.current) return; // ya inicializado
      (async () => {
        const ok = await loadGoogleMaps();
        if (!ok || !mapContainerRef.current) {
          // Si no se pudo cargar la API (p. ej. falta VITE_GOOGLE_MAPS_API_KEY), caemos a Leaflet
          setGoogleInitFailed(true);
          setEffectiveProvider('leaflet');
          return;
        }
        const w = window as any;
        let gmap: any;
        try {
          gmap = new w.google.maps.Map(mapContainerRef.current, {
            center: position ?? defaultCenter,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
        } catch (e) {
          // Por ejemplo, ApiNotActivatedMapError u otros errores de inicialización
          console.error('Google Maps init error', e);
          setGoogleInitFailed(true);
          setEffectiveProvider('leaflet');
          return;
        }
        gmap.addListener('click', async (e: { latLng: { lat: () => number; lng: () => number } }) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setPosition({ lat, lng });
          setGeocodingLoading(true);
          if (googleMarkerRef.current) googleMarkerRef.current.setPosition({ lat, lng });
          else googleMarkerRef.current = new w.google.maps.Marker({ position: { lat, lng }, map: gmap });
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
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
            const knownTypes: Record<string, string> = {
              cl: 'Calle', cll: 'Calle', calle: 'Calle',
              cra: 'Carrera', cr: 'Carrera', carrera: 'Carrera', kr: 'Carrera',
              av: 'Avenida', avd: 'Avenida', avenida: 'Avenida',
              tv: 'Transversal', transversal: 'Transversal',
              diag: 'Diagonal', diagonal: 'Diagonal',
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
                }
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
        });
        googleMapRef.current = gmap;
      })();
      return;
    }

    // Leaflet (por defecto)
  if (mapRef.current) return; // ya inicializado
  const map = L.map(mapContainerRef.current).setView(position ?? defaultCenter, 13);
    // Capa base con fallback si falla la carga de tiles
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    baseLayer.on('tileerror', () => {
      try {
        const alt = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
        });
        alt.addTo(map);
        map.removeLayer(baseLayer);
      } catch { /* noop */ }
    });
    const invalidate = () => { try { map.invalidateSize(); } catch { /* noop */ } };
    map.whenReady(() => {
      requestAnimationFrame(invalidate);
      setTimeout(invalidate, 0);
      setTimeout(invalidate, 250);
      setTimeout(invalidate, 500);
      setTimeout(invalidate, 1000);
      // marcar como listo para aceptar actualizaciones de posición
      setLeafletReady(true);
    });
    window.addEventListener('resize', invalidate);
    // Observa cambios del contenedor y fuerza recálculo de tamaño
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => invalidate());
      ro.observe(mapContainerRef.current as Element);
    } catch { /* noop */ }
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng;
      setPosition(latlng);
      setGeocodingLoading(true);
      if (markerRef.current) markerRef.current.setLatLng(latlng);
      else markerRef.current = L.marker(latlng, { icon: locationIcon }).addTo(map);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latlng.lat)}&lon=${encodeURIComponent(latlng.lng)}&addressdetails=1`;
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
        const knownTypes: Record<string, string> = {
          cl: 'Calle', cll: 'Calle', calle: 'Calle',
          cra: 'Carrera', cr: 'Carrera', carrera: 'Carrera', kr: 'Carrera',
          av: 'Avenida', avd: 'Avenida', avenida: 'Avenida',
          tv: 'Transversal', transversal: 'Transversal',
          diag: 'Diagonal', diagonal: 'Diagonal',
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
            }
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
    });
    mapRef.current = map;
    return () => {
      window.removeEventListener('resize', invalidate);
      if (ro) { try { ro.disconnect(); } catch { /* noop */ } ro = null; }
      try { map.remove(); } catch { /* noop */ }
      mapRef.current = null;
      markerRef.current = null;
      setLeafletReady(false);
    };
  }, [effectiveProvider]);

  // 2) Cuando cambia la posición, centrar mapa y mover/crear el marcador (Leaflet o Google)
  useEffect(() => {
    if (!position) return;
    // Google
    if (effectiveProvider === 'google' && googleMapRef.current) {
      const w = window as any;
      const gmap = googleMapRef.current as any;
      gmap.setCenter(position);
      if (googleMarkerRef.current) {
        googleMarkerRef.current.setPosition(position);
      } else if (w.google && w.google.maps) {
        googleMarkerRef.current = new w.google.maps.Marker({ position, map: gmap });
      }
      return;
    }
    // Leaflet
    if (!mapRef.current || !leafletReady) return;
    try {
      mapRef.current.setView(position, mapRef.current.getZoom());
      try { mapRef.current.invalidateSize(); } catch { /* noop */ }
      if (markerRef.current) {
        // Si el marcador aún no tiene icono (no está en el mapa), volver a crearlo de forma segura
        const hasIcon = (markerRef.current as unknown as { _icon?: HTMLElement })._icon;
        if (hasIcon) {
          markerRef.current.setLatLng(position);
        } else {
          try { markerRef.current.remove(); } catch { /* noop */ }
          markerRef.current = L.marker(position, { icon: locationIcon }).addTo(mapRef.current);
        }
      } else {
        markerRef.current = L.marker(position, { icon: locationIcon }).addTo(mapRef.current);
      }
    } catch (e) {
      // En casos raros (p. ej. navegación rápida), deferir actualización al siguiente frame
      requestAnimationFrame(() => {
        if (!mapRef.current) return;
        try {
          mapRef.current!.setView(position, mapRef.current!.getZoom());
          if (markerRef.current) {
            try { markerRef.current.setLatLng(position); } catch { /* noop */ }
          } else {
            markerRef.current = L.marker(position, { icon: locationIcon }).addTo(mapRef.current!);
          }
        } catch { /* noop */ }
      });
    }
  }, [position, effectiveProvider, leafletReady]);

  // 3) Si venimos a editar, precargar datos de la dirección
  useEffect(() => {
    if (mode === 'edit' && addressId) {
      (async () => {
        try {
          const a = await addressService.getAddressById(addressId);
          if (a) {
            const parts = (a.street || '').split(' ');
            if (parts.length > 1) {
              setStreetType(parts[0]);
              setStreet(parts.slice(1).join(' '));
            } else {
              setStreet(a.street || '');
            }
            setNumber(a.number || '');
            // Validar números antes de actualizar posición (evita NaN)
            const lat = Number(a.latitude);
            const lng = Number(a.longitude);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              setPosition({ lat, lng });
            }
          }
        } catch (err) {
          console.error('Error loading address for edit', err);
        }
      })();
    }
  }, [mode, addressId]);

  // 4) Guardar (create/update) reutilizando el servicio existente
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
    } catch (err: any) {
      console.error('Save address error', err);
      
      // Manejo de errores específicos del backend
      // El backend retorna error 400 cuando el usuario ya tiene una dirección
      if (err?.response?.status === 400) {
        const errorMsg = err?.response?.data?.error || '';
        if (errorMsg.includes('already has an address')) {
          toast.error('❌ Este usuario ya tiene una dirección registrada. Solo puede tener una dirección por usuario.', {
            duration: 5000,
            style: {
              maxWidth: '500px',
            }
          });
        } else if (errorMsg.includes('required')) {
          toast.error('⚠️ Faltan campos requeridos: Street y Number');
        } else {
          toast.error(`Error: ${errorMsg || 'No se pudo guardar la dirección'}`);
        }
      } else if (err?.response?.status === 404) {
        toast.error('❌ Usuario no encontrado en el sistema');
      } else {
        toast.error('Error al guardar la dirección');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 5) Geocodificar al escribir (con debounce) para mover el mapa automáticamente
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!street || !number) return;

    debounceRef.current = window.setTimeout(async () => {
      setGeocodingLoading(true);
      if (abortControllerRef.current) abortControllerRef.current.abort();
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
          setPosition({ lat: Number(r.lat), lng: Number(r.lon) });
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

  // 6) Botón para geocodificar manualmente
  const geocodeNow = async () => {
    if (!street || !number) {
      toast.error('Street y Number son obligatorios para buscar');
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
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

  // Render: mismo layout, pero el mapa ahora es un <div> donde Leaflet dibuja
  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 rounded border bg-white p-4">
          {/*
            Contenedor del mapa. Para Google Maps, si falló la inicialización (p. ej. falta API key),
            mostramos un overlay simple con una pista para el desarrollador. Esto no toca backend.
          */}
          <div ref={mapContainerRef} style={{ height: 360, width: '100%', position: 'relative' }} className="rounded overflow-hidden">
            {effectiveProvider === 'google' && googleInitFailed && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'repeating-linear-gradient(45deg, rgba(255,0,0,0.06), rgba(255,0,0,0.06) 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)'
              }}>
                <span className="text-sm text-gray-700 bg-white/80 px-3 py-2 rounded shadow">
                  No se pudo cargar Google Maps. Verifica tu variable VITE_GOOGLE_MAPS_API_KEY y recarga la página.
                </span>
              </div>
            )}
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
