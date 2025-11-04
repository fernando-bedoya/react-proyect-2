import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import { Plus, RefreshCw, MapPin } from 'lucide-react';
import GenericTable from '../../components/GenericTable';
import GenericModal from '../../components/GenericModal';
import GenericAddressForm from '../../components/GenericsMaterial/GenericAddressForm';
import ThemeSelector from '../../components/ThemeSelector';
import addressService from '../../services/addressService';
import userService from '../../services/userService';
import type { Address } from '../../models/Address';
import type { User } from '../../models/User';
import Swal from 'sweetalert2';

const AddressView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(userIdParam ? Number(userIdParam) : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedUserForCreate, setSelectedUserForCreate] = useState<number | null>(null);
  const [loadingUserAddress, setLoadingUserAddress] = useState(false);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  // Cargar dirección del usuario seleccionado automáticamente
  // Esto permite pre-cargar los datos si el usuario ya tiene dirección
  useEffect(() => {
    const loadUserAddress = async () => {
      if (!selectedUserForCreate || modalMode !== 'create') return;
      
      setLoadingUserAddress(true);
      try {
        // Intentar obtener la dirección del usuario seleccionado
        const existingAddress = await addressService.getAddressByUserId(selectedUserForCreate);
        if (existingAddress) {
          // Si el usuario ya tiene dirección, cambiar a modo edición
          setSelectedAddress(existingAddress);
          setModalMode('edit');
          Swal.fire({
            icon: 'info',
            title: 'Usuario con dirección existente',
            text: 'Este usuario ya tiene una dirección. Se ha cargado para edición.',
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } catch (err: any) {
        // Si no tiene dirección (404), está bien - continuar con creación
        console.log('Usuario sin dirección existente, continuar con creación');
      } finally {
        setLoadingUserAddress(false);
      }
    };
    
    loadUserAddress();
  }, [selectedUserForCreate, modalMode]);

  // Cargar direcciones
  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = selectedUserId 
        ? [await addressService.getAddressByUserId(selectedUserId)].filter(Boolean) as Address[]
        : await addressService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      console.error('Error loading addresses:', err);
      setError(err.message || 'Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  // Actualizar URL cuando cambia el filtro de usuario
  const handleUserFilterChange = (userId: string) => {
    if (userId) {
      setSelectedUserId(Number(userId));
      setSearchParams({ userId });
    } else {
      setSelectedUserId(null);
      setSearchParams({});
    }
  };

  // Configuración de columnas para la tabla
  const columns = ['id', 'street', 'number', 'latitude', 'longitude', 'userId'];
  
  const columnLabels = {
    id: 'ID',
    street: 'Calle',
    number: 'Número',
    latitude: 'Latitud',
    longitude: 'Longitud',
    userId: 'Usuario ID'
  };

  // Formatear datos para mostrar coordenadas con 6 decimales
  const tableData = addresses.map(addr => ({
    ...addr,
    latitude: addr.latitude?.toFixed(6),
    longitude: addr.longitude?.toFixed(6)
  }));

  // Acciones de la tabla (combinadas)
  const actions = [
    {
      name: 'edit',
      label: 'Editar',
      icon: 'edit' as const,
      variant: 'warning' as const
    },
    {
      name: 'delete',
      label: 'Eliminar',
      icon: 'delete' as const,
      variant: 'outline-danger' as const
    },
    {
      name: 'viewMap',
      label: 'Ver en Mapa',
      icon: 'map' as const,
      variant: 'info' as const
    }
  ];

  // Handlers
  const handleAction = async (actionName: string, item: Record<string, any>) => {
    // Encontrar la dirección original en el array
    const address = addresses.find(addr => addr.id === item.id);
    if (!address) return;

    switch (actionName) {
      case 'edit':
        setSelectedAddress(address);
        setModalMode('edit');
        setShowModal(true);
        break;
      case 'delete':
        const result = await Swal.fire({
          title: '¿Eliminar dirección?',
          text: `¿Estás seguro de eliminar la dirección ${address.street} ${address.number}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
          try {
            await addressService.deleteAddress(address.id);
            Swal.fire('¡Eliminado!', 'Dirección eliminada exitosamente', 'success');
            loadAddresses();
          } catch (err: any) {
            Swal.fire('Error', err.message || 'Error al eliminar dirección', 'error');
          }
        }
        break;
      case 'viewMap':
        window.open(
          `https://www.google.com/maps?q=${address.latitude},${address.longitude}`,
          '_blank'
        );
        break;
    }
  };

  const handleCreate = () => {
    setSelectedAddress(null);
    setSelectedUserForCreate(selectedUserId); // Pre-seleccionar el usuario filtrado si existe
    setModalMode('create');
    setShowModal(true);
  };

  const handleSaved = () => {
    setShowModal(false);
    setSelectedAddress(null);
    setSelectedUserForCreate(null);
    loadAddresses();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h2 fw-bold mb-2" style={{ color: '#10b981' }}>
                <MapPin className="me-2" size={32} />
                📍 Direcciones
              </h2>
              {selectedUserId && <Badge bg="info">Filtrado por Usuario ID: {selectedUserId}</Badge>}
            </div>
            <div className="d-flex gap-2 align-items-center">
              <ThemeSelector />
              <Button variant="outline-secondary" onClick={loadAddresses} disabled={loading}>
                <RefreshCw size={16} className="me-2" />
                Actualizar
              </Button>
              <Button variant="success" onClick={handleCreate}>
                <Plus size={16} className="me-2" />
                Crear Dirección
              </Button>
            </div>
          </div>
          
          {/* Filtro por usuario */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Filtrar por Usuario</Form.Label>
                <Form.Select
                  value={selectedUserId || ''}
                  onChange={(e) => handleUserFilterChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Todos los usuarios</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Cargando direcciones...</p>
        </div>
      ) : (
        <GenericTable
          data={tableData}
          columns={columns}
          columnLabels={columnLabels}
          actions={actions}
          onAction={handleAction}
          emptyMessage={selectedUserId ? 'Este usuario no tiene dirección registrada' : 'No hay direcciones registradas'}
        />
      )}

      {/* Modal con mapa de Google Maps / Leaflet */}
      <GenericModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedAddress(null);
          setSelectedUserForCreate(null);
        }}
        title={modalMode === 'create' ? '📍 Crear Dirección' : '📍 Editar Dirección'}
        size="xl"
      >
        {modalMode === 'create' && !selectedUserForCreate ? (
          // Selector de usuario cuando no hay userId pre-seleccionado
          <div className="p-4">
            <Alert variant="info">
              Selecciona el usuario para el cual deseas crear una dirección:
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Usuario *</Form.Label>
              <Form.Select
                value={selectedUserForCreate || ''}
                onChange={(e) => setSelectedUserForCreate(Number(e.target.value))}
                size="lg"
              >
                <option value="">-- Seleccione un usuario --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                disabled={!selectedUserForCreate}
                onClick={() => {
                  // Solo continuar si hay usuario seleccionado
                  if (selectedUserForCreate) {
                    // El formulario ya se mostrará porque selectedUserForCreate tiene valor
                  }
                }}
              >
                Continuar
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedUserForCreate(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : loadingUserAddress ? (
          // Indicador de carga mientras se verifica si el usuario tiene dirección
          <div className="p-5 text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Verificando dirección del usuario...</p>
          </div>
        ) : (
          // Formulario de dirección con mapa
          <GenericAddressForm
            mode={modalMode}
            userId={selectedUserForCreate || selectedAddress?.userId}
            addressId={selectedAddress?.id}
            initial={selectedAddress || undefined}
            onSaved={handleSaved}
            onCancel={() => {
              setShowModal(false);
              setSelectedAddress(null);
              setSelectedUserForCreate(null);
            }}
            mapProvider="leaflet"
          />
        )}
      </GenericModal>
    </Container>
  );
};

export default AddressView;
