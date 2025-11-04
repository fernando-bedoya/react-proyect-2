// UserView.jsx - Vista completa de Gestión de Usuarios
// Consume GET /users y muestra tabla con columnas: id, name, email, options
// La columna options incluye 9 acciones: View, Update, Delete, Profile, Address, Digital Signature, Device, Password, Session
// Usa GenericTable, ThemeSelector y baseService

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Spinner,
  Alert,
  Badge,
  OverlayTrigger,
  Tooltip,
  ButtonGroup,
  Dropdown,
} from 'react-bootstrap';
import {
  FaUser,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaMapMarkerAlt,
  FaFileSignature,
  FaMobileAlt,
  FaKey,
  FaClock,
  FaUserPlus,
} from 'react-icons/fa';
import GenericTable from '../../components/GenericTable';
import ThemeSelector from '../../components/ThemeSelector';
import { getAll, remove } from '../../services/baseService';
import addressService from '../../services/addressService';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import Swal from 'sweetalert2';

const UserView = () => {
  const navigate = useNavigate();
  const styles = useThemeStyles();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado para modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Carga todos los usuarios desde el backend
   */
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.message || err.message));
      setUsers([]);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navega a la vista de crear usuario
   */
  const handleCreate = () => {
    navigate('/users/create');
  };

  /**
   * Navega a la vista de detalle del usuario (View)
   */
  const handleView = (user) => {
    navigate(`/users/view/${user.id}`);
  };

  /**
   * Navega a la vista de edición del usuario (Update)
   */
  const handleUpdate = (user) => {
    navigate(`/users/update/${user.id}`);
  };

  /**
   * Abre modal de confirmación para eliminar usuario (Delete)
   */
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  /**
   * Confirma y ejecuta la eliminación del usuario
   */
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setShowDeleteModal(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await remove('users', userToDelete.id);
      setSuccess(`Usuario "${userToDelete.name || userToDelete.email}" eliminado exitosamente`);
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El usuario ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      // Recargar lista
      await loadUsers();
    } catch (err) {
      setError('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el usuario',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };

  /**
   * Navega a la vista de perfil del usuario
   */
  const handleProfile = (user) => {
    navigate(`/profiles?userId=${user.id}`);
  };

  /**
   * Navega a la vista de direcciones del usuario
   */
  const handleAddress = (user) => {
    // Ir siempre a la lista de direcciones del usuario (si no tiene, mostrará vacío con opción de crear)
    navigate(`/addresses?userId=${user.id}`);
  };

  /**
   * Navega a la vista de firmas digitales del usuario
   */
  const handleDigitalSignature = (user) => {
    navigate(`/digital-signatures?userId=${user.id}`);
  };

  /**
   * Navega a la vista de dispositivos del usuario
   */
  const handleDevice = (user) => {
    navigate(`/devices?userId=${user.id}`);
  };

  /**
   * Navega a la vista de contraseñas del usuario
   */
  const handlePassword = (user) => {
    navigate(`/passwords/list?userId=${user.id}`);
  };

  /**
   * Navega a la vista de sesiones del usuario
   */
  const handleSession = (user) => {
    navigate(`/sessions?userId=${user.id}`);
  };

  /**
   * Renderiza la columna de opciones con todos los botones de acción
   * Incluye: View, Update, Delete, Profile, Address, Digital Signature, Device, Password, Session
   */
  const renderOptions = (user) => {
    return (
      <div className="d-flex flex-wrap gap-1">
        {/* Botón View */}
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Ver detalles</Tooltip>}
        >
          <Button
            variant="info"
            size="sm"
            onClick={() => handleView(user)}
            aria-label={`Ver usuario ${user.name}`}
          >
            <FaEye />
          </Button>
        </OverlayTrigger>

        {/* Botón Update */}
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Editar usuario</Tooltip>}
        >
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleUpdate(user)}
            aria-label={`Editar usuario ${user.name}`}
          >
            <FaEdit />
          </Button>
        </OverlayTrigger>

        {/* Botón Delete */}
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Eliminar usuario</Tooltip>}
        >
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(user)}
            aria-label={`Eliminar usuario ${user.name}`}
          >
            <FaTrash />
          </Button>
        </OverlayTrigger>

        {/* Dropdown con más opciones */}
        <Dropdown as={ButtonGroup}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Más opciones</Tooltip>}
          >
            <Dropdown.Toggle
              variant="secondary"
              size="sm"
              id={`dropdown-user-${user.id}`}
              aria-label={`Más opciones para ${user.name}`}
            >
              <FaUser />
            </Dropdown.Toggle>
          </OverlayTrigger>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleProfile(user)}>
              <FaUserCircle className="me-2" />
              Perfil
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleAddress(user)}>
              <FaMapMarkerAlt className="me-2" />
              Direcciones
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDigitalSignature(user)}>
              <FaFileSignature className="me-2" />
              Firma Digital
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDevice(user)}>
              <FaMobileAlt className="me-2" />
              Dispositivos
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handlePassword(user)}>
              <FaKey className="me-2" />
              Contraseña
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSession(user)}>
              <FaClock className="me-2" />
              Sesiones
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  /**
   * Prepara los datos para GenericTable
   * Agrega una columna virtual "options_render" con los botones renderizados
   */
  const tableData = users.map((user) => ({
    ...user,
    options_render: renderOptions(user),
  }));

  // Definir columnas según el mockup: id, name, email, options
  const columns = ['id', 'name', 'email', 'options_render'];

  return (
    <div className={styles.container}>
      {/* Encabezado con título y ThemeSelector */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className={`${styles.heading2} mb-1`}>
              <FaUser className="me-2" />
              Gestión de Usuarios
            </h2>
            <p className={`${styles.textMuted} mb-0`}>
              Administre todos los usuarios del sistema
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="success"
              onClick={handleCreate}
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              <FaUserPlus />
              Nuevo Usuario
            </Button>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess('')}
          className="mb-3"
        >
          <strong>✓</strong> {success}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-3"
        >
          <strong>✗</strong> {error}
        </Alert>
      )}

      {/* Tabla de usuarios */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h5 className="mb-0">
            Lista de Usuarios
            {!loading && (
              <Badge bg="secondary" className="ms-2">
                {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
              </Badge>
            )}
          </h5>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Cargando usuarios...</span>
              </Spinner>
              <p className="mt-3 text-muted">Cargando usuarios...</p>
            </div>
          ) : (
            <GenericTable
              data={tableData}
              columns={columns}
              actions={[]} // Las acciones se manejan en la columna options_render
              onAction={() => {}} // No se usa porque las acciones están en options_render
              striped
              hover
              responsive
              emptyMessage="No hay usuarios registrados en el sistema"
            />
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrash className="me-2 text-danger" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p className="mb-2">
                ¿Está seguro de que desea eliminar al usuario?
              </p>
              <div className="bg-light p-3 rounded">
                <strong>ID:</strong> {userToDelete.id}
                <br />
                <strong>Nombre:</strong> {userToDelete.name || 'N/A'}
                <br />
                <strong>Email:</strong> {userToDelete.email}
              </div>
              <Alert variant="warning" className="mt-3 mb-0">
                <small>
                  <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer.
                  Se eliminarán todos los datos asociados al usuario.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={loading}
          >
            <FaTrash className="me-2" />
            Eliminar Usuario
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserView;
