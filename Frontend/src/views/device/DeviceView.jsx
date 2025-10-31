// DeviceView.jsx - Vista completa para gestión de dispositivos
// Este componente permite listar, crear, editar y eliminar dispositivos con búsqueda y paginación
// Sirve para administrar los dispositivos de los usuarios utilizando componentes genéricos reutilizables

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import {
  FaPlus,
  FaLaptop,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { getAll, getById, create, update, remove } from '../../services/baseService';
import EntityTable from '../../components/common/EntityTable';
import EntityForm from '../../components/common/EntityForm';
import ThemeSelector from '../../components/ThemeSelector';

const DeviceView = () => {
  // Estados principales
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [currentDevice, setCurrentDevice] = useState(null);

  // Estados de búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDevices();
    loadUsers();
  }, []);

  // Filtrar dispositivos cuando cambia el término de búsqueda
  useEffect(() => {
    filterDevices();
  }, [searchTerm, devices]);

  /**
   * Carga todos los dispositivos
   */
  const loadDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('devices');
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar los dispositivos: ' + (err.response?.data?.message || err.message));
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga la lista de usuarios para el selector
   */
  const loadUsers = async () => {
    try {
      const data = await getAll('users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsers([]);
    }
  };

  /**
   * Filtra los dispositivos según el término de búsqueda
   */
  const filterDevices = () => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = devices.filter((device) => {
      const userName = getUserName(device.user_id).toLowerCase();
      const deviceName = (device.device_name || '').toLowerCase();
      const ipAddress = (device.ip_address || '').toLowerCase();
      const status = (device.status || '').toLowerCase();

      return (
        device.id.toString().includes(term) ||
        userName.includes(term) ||
        deviceName.includes(term) ||
        ipAddress.includes(term) ||
        status.includes(term)
      );
    });

    setFilteredDevices(filtered);
    setCurrentPage(1); // Resetear a la primera página
  };

  /**
   * Obtiene el nombre del usuario por ID
   */
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username || user.name || user.email : `Usuario ${userId}`;
  };

  /**
   * Limpia el filtro de búsqueda
   */
  const clearSearch = () => {
    setSearchTerm('');
  };

  /**
   * Abre el modal para crear un nuevo dispositivo
   */
  const handleCreate = () => {
    setModalMode('create');
    setCurrentDevice(null);
    setShowModal(true);
  };

  /**
   * Abre el modal para editar un dispositivo existente
   */
  const handleEdit = (device) => {
    setModalMode('edit');
    setCurrentDevice(device);
    setShowModal(true);
  };

  /**
   * Elimina un dispositivo
   */
  const handleDelete = async (device) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar el dispositivo "${device.device_name}"?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await remove('devices', device.id);
      setSuccess('Dispositivo eliminado exitosamente');
      await loadDevices();
    } catch (err) {
      setError('Error al eliminar el dispositivo: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda el dispositivo (crear o editar)
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        // El backend espera POST a /devices/user/{user_id}
        const { user_id, device_name, ip_address, operating_system } = formData;
        
        // Mapear campos del frontend a los nombres que espera el backend
        const deviceData = {
          name: device_name,
          ip: ip_address,
          operating_system: operating_system || ''
        };
        
        console.log('📱 Creando dispositivo para user_id:', user_id);
        console.log('📱 Datos del dispositivo:', deviceData);
        
        await create(`devices/user/${user_id}`, deviceData);
        setSuccess('Dispositivo creado exitosamente');
      } else {
        // El backend espera PUT a /devices/{device_id}
        const { user_id, device_name, ip_address, operating_system } = formData;
        
        // Mapear campos para actualización
        const deviceData = {
          name: device_name,
          ip: ip_address,
          operating_system: operating_system || ''
        };
        
        await update('devices', currentDevice.id, deviceData);
        setSuccess('Dispositivo actualizado exitosamente');
      }

      await loadDevices();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        modalMode === 'create'
          ? 'Error al crear el dispositivo: '
          : 'Error al actualizar el dispositivo: ';
      setError(errorMessage + (err.response?.data?.message || err.message));
      throw err; // Para que el formulario maneje el error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra el modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDevice(null);
  };

  /**
   * Configuración de campos para el formulario
   */
  const formFields = [
    {
      name: 'user_id',
      label: 'Usuario',
      type: 'select',
      required: true,
      options: users.map((user) => ({
        value: user.id,
        label: `${user.username || user.name || user.email} (ID: ${user.id})`,
      })),
      colSize: 12,
      helpText: 'Seleccione el usuario propietario del dispositivo',
    },
    {
      name: 'device_name',
      label: 'Nombre del Dispositivo',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 100,
      placeholder: 'Ej: Laptop HP, iPhone 12, Router Cisco',
      colSize: 6,
    },
    {
      name: 'ip_address',
      label: 'Dirección IP',
      type: 'text',
      required: true,
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      patternMessage: 'Ingrese una dirección IP válida (ej: 192.168.1.1)',
      placeholder: '192.168.1.100',
      colSize: 6,
      helpText: 'Formato: xxx.xxx.xxx.xxx',
    },
    {
      name: 'operating_system',
      label: 'Sistema Operativo',
      type: 'select',
      required: false,
      options: [
        { value: 'Windows 11', label: 'Windows 11' },
        { value: 'Windows 10', label: 'Windows 10' },
        { value: 'macOS', label: 'macOS' },
        { value: 'Linux Ubuntu', label: 'Linux Ubuntu' },
        { value: 'Linux Debian', label: 'Linux Debian' },
        { value: 'iOS', label: 'iOS' },
        { value: 'Android', label: 'Android' },
        { value: 'Other', label: 'Otro' },
      ],
      colSize: 12,
      defaultValue: '',
      helpText: 'Sistema operativo del dispositivo (opcional)',
    },
  ];

  /**
   * Configuración de columnas para la tabla
   */
  const tableColumns = [
    {
      key: 'id',
      label: 'ID',
      cellClassName: 'text-center',
      render: (value) => <Badge bg="secondary">{value}</Badge>,
    },
    {
      key: 'user_id',
      label: 'Usuario',
      render: (value) => <span className="fw-bold">{getUserName(value)}</span>,
    },
    {
      key: 'device_name',
      label: 'Nombre del Dispositivo',
    },
    {
      key: 'ip_address',
      label: 'Dirección IP',
      cellClassName: 'font-monospace',
    },
    {
      key: 'status',
      label: 'Estado',
      cellClassName: 'text-center',
      render: (value) => {
        const statusConfig = {
          active: { bg: 'success', icon: FaCheckCircle, text: 'Activo' },
          inactive: { bg: 'danger', icon: FaTimesCircle, text: 'Inactivo' },
          maintenance: { bg: 'warning', icon: null, text: 'Mantenimiento' },
          retired: { bg: 'secondary', icon: null, text: 'Retirado' },
        };

        const config = statusConfig[value] || statusConfig.inactive;
        const Icon = config.icon;

        return (
          <Badge bg={config.bg} className="d-flex align-items-center justify-content-center gap-1">
            {Icon && <Icon />}
            {config.text}
          </Badge>
        );
      },
    },
  ];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="py-4">
      {/* Encabezado con Selector de Tema */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1">
                <FaLaptop className="me-2" />
                Gestión de Dispositivos
              </h2>
              <p className="text-muted mb-0">
                Administre los dispositivos de los usuarios del sistema
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <ThemeSelector />
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={loading}
              >
                <FaPlus className="me-2" />
                Nuevo Dispositivo
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mensajes de éxito y error */}
      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess('')}
          className="mb-3"
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <Row className="mb-3">
        <Col md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por ID, usuario, nombre, IP o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={clearSearch}>
                <FaTimes />
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={6} lg={8} className="d-flex align-items-center">
          <small className="text-muted">
            Mostrando {currentItems.length} de {filteredDevices.length} dispositivos
            {searchTerm && ' (filtrados)'}
          </small>
        </Col>
      </Row>

      {/* Tabla de dispositivos */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Lista de Dispositivos</h5>
            </Card.Header>
            <Card.Body>
              {loading && devices.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando dispositivos...</p>
                </div>
              ) : (
                <>
                  <EntityTable
                    columns={tableColumns}
                    data={currentItems}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    striped
                    bordered
                    hover
                    responsive
                    emptyMessage="No se encontraron dispositivos"
                  />

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <nav>
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </button>
                          </li>

                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Mostrar solo páginas cercanas a la actual
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <li
                                  key={pageNumber}
                                  className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return (
                                <li key={pageNumber} className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              );
                            }
                            return null;
                          })}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Siguiente
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para crear/editar dispositivo */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? (
              <>
                <FaPlus className="me-2" />
                Nuevo Dispositivo
              </>
            ) : (
              <>
                <FaLaptop className="me-2" />
                Editar Dispositivo
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EntityForm
            fields={formFields}
            onSubmit={handleSubmit}
            initialValues={currentDevice || {}}
            submitButtonText={modalMode === 'create' ? 'Crear Dispositivo' : 'Actualizar Dispositivo'}
            showCancelButton={true}
            onCancel={handleCloseModal}
            isLoading={loading}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DeviceView;
