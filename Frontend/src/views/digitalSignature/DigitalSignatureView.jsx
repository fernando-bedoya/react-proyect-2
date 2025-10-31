// DigitalSignatureView.jsx - Vista completa para gestión de firmas digitales
// Este componente permite listar, crear, editar y eliminar firmas digitales de usuarios
// Sirve para administrar las firmas digitales con previsualización de imágenes y validaciones

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaUpload,
  FaTimes,
} from 'react-icons/fa';
import { getAll, getById, create, update, remove } from '../../services/baseService';
import ThemeSelector from '../../components/ThemeSelector';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const DigitalSignatureView = () => {
  const styles = useThemeStyles();
  
  // Estados principales
  const [signatures, setSignatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [currentSignature, setCurrentSignature] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    user_id: '',
    file: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadSignatures();
    loadUsers();
  }, []);

  /**
   * Carga todas las firmas digitales
   */
  const loadSignatures = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('digital-signatures');
      setSignatures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las firmas digitales: ' + (err.response?.data?.message || err.message));
      setSignatures([]);
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
   * Abre el modal para crear una nueva firma
   */
  const handleCreate = () => {
    setModalMode('create');
    setCurrentSignature(null);
    setFormData({ user_id: '', file: null });
    setImagePreview(null);
    setFormErrors({});
    setShowModal(true);
  };

  /**
   * Abre el modal para editar una firma existente
   */
  const handleEdit = async (signature) => {
    setModalMode('edit');
    setCurrentSignature(signature);
    setFormData({
      user_id: signature.user_id,
      file: null,
    });
    
    // Si hay una URL de imagen, mostrarla como preview
    if (signature.filename) {
      setImagePreview(`http://localhost:5000/uploads/${signature.filename}`);
    } else {
      setImagePreview(null);
    }
    
    setFormErrors({});
    setShowModal(true);
  };

  /**
   * Maneja el cambio en el selector de usuario
   */
  const handleUserChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      user_id: e.target.value,
    }));
    
    // Limpiar error de user_id si existe
    if (formErrors.user_id) {
      setFormErrors((prev) => ({ ...prev, user_id: '' }));
    }
  };

  /**
   * Maneja la selección de archivo y genera la previsualización
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          file: 'Por favor seleccione una imagen válida (JPG, PNG, GIF)',
        }));
        return;
      }

      // Validar tamaño (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        setFormErrors((prev) => ({
          ...prev,
          file: 'El archivo no debe superar los 5MB',
        }));
        return;
      }

      // Actualizar formData
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));

      // Generar previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error de archivo si existe
      setFormErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  /**
   * Limpia el archivo seleccionado
   */
  const handleClearFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    setImagePreview(modalMode === 'edit' && currentSignature?.filename 
      ? `http://localhost:5000/uploads/${currentSignature.filename}`
      : null
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.user_id) {
      errors.user_id = 'Debe seleccionar un usuario';
    }

    if (modalMode === 'create' && !formData.file) {
      errors.file = 'Debe seleccionar un archivo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Guarda la firma digital (crear o editar)
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear FormData para enviar el archivo
      const formDataToSend = new FormData();
      
      if (formData.file) {
        // Verificar que sea un objeto File real, no una URL
        if (formData.file instanceof File) {
          formDataToSend.append('photo', formData.file);
          console.log('📎 Archivo adjuntado:', formData.file.name, formData.file.type);
        } else {
          throw new Error('El archivo debe ser un objeto File, no una URL');
        }
      } else {
        throw new Error('Debe seleccionar un archivo de imagen');
      }

      if (modalMode === 'create') {
        // Crear nueva firma - el backend espera POST a /digital-signatures/user/{user_id}
        await create(`digital-signatures/user/${formData.user_id}`, formDataToSend);
        setSuccess('Firma digital creada exitosamente');
      } else {
        // Editar firma existente - el backend espera PUT a /digital-signatures/{signature_id}
        await update('digital-signatures', currentSignature.id, formDataToSend);
        setSuccess('Firma digital actualizada exitosamente');
      }

      // Recargar lista y cerrar modal
      await loadSignatures();
      handleCloseModal();
    } catch (err) {
      setError(
        modalMode === 'create'
          ? 'Error al crear la firma: ' + (err.response?.data?.message || err.message)
          : 'Error al actualizar la firma: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una firma digital
   */
  const handleDelete = async (signature) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar la firma digital de ${signature.filename}?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await remove('digital-signatures', signature.id);
      setSuccess('Firma digital eliminada exitosamente');
      await loadSignatures();
    } catch (err) {
      setError('Error al eliminar la firma: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra el modal y limpia el estado
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSignature(null);
    setFormData({ user_id: '', file: null });
    setImagePreview(null);
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Obtiene el nombre del usuario por ID
   */
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username || user.name || user.email : `Usuario ${userId}`;
  };

  /**
   * Formatea la fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      {/* Encabezado con Selector de Tema */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className={`${styles.heading2} mb-1`}>
              <FaImage className="me-2" />
              Gestión de Firmas Digitales
            </h2>
            <p className={`${styles.textMuted} mb-0`}>
              Administre las firmas digitales de los usuarios
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <ThemeSelector />
            <button
              className={styles.buttonPrimary}
              onClick={handleCreate}
              disabled={loading}
            >
              <FaPlus className="me-2" />
              Nueva Firma
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {success && (
        <div className={`${styles.alertSuccess} mb-3`}>
          <div className="d-flex justify-content-between align-items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="btn-close"></button>
          </div>
        </div>
      )}

      {error && (
        <div className={`${styles.alertDanger} mb-3`}>
          <div className="d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="btn-close"></button>
          </div>
        </div>
      )}

      {/* Tabla de firmas digitales */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h5 className="mb-0">Lista de Firmas Digitales</h5>
        </div>
        <div className={styles.cardBody}>
          {loading && signatures.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando firmas digitales...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Usuario</th>
                        <th>Nombre del Archivo</th>
                        <th style={{ width: '180px' }}>Fecha de Creación</th>
                        <th style={{ width: '150px' }} className="text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {signatures.length > 0 ? (
                        signatures.map((signature) => (
                          <tr key={signature.id}>
                            <td>
                              <Badge bg="secondary">{signature.id}</Badge>
                            </td>
                            <td>{getUserName(signature.user_id)}</td>
                            <td>
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                {signature.filename || 'Sin archivo'}
                              </span>
                            </td>
                            <td>{formatDate(signature.created_at)}</td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => handleEdit(signature)}
                                  disabled={loading}
                                  title="Editar"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(signature)}
                                  disabled={loading}
                                  title="Eliminar"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">
                            <FaImage size={48} className="mb-3 opacity-50" />
                            <p className="mb-0">
                              No hay firmas digitales registradas
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar firma */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? (
              <>
                <FaPlus className="me-2" />
                Nueva Firma Digital
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Firma Digital
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Selector de usuario */}
            <Form.Group className="mb-3">
              <Form.Label>
                Usuario <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.user_id}
                onChange={handleUserChange}
                isInvalid={!!formErrors.user_id}
                disabled={loading}
              >
                <option value="">Seleccione un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.name || user.email} (ID: {user.id})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.user_id}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Campo de archivo */}
            <Form.Group className="mb-3">
              <Form.Label>
                Archivo de Firma {modalMode === 'create' && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                isInvalid={!!formErrors.file}
                accept="image/*"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.file}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
              </Form.Text>
            </Form.Group>

            {/* Previsualización de imagen */}
            {imagePreview && (
              <div className="mb-3">
                <Form.Label>Previsualización:</Form.Label>
                <div className="position-relative" style={{ maxWidth: '400px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="img-thumbnail w-100"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                  {formData.file && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={handleClearFile}
                      title="Eliminar imagen"
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                {modalMode === 'create' ? 'Crear Firma' : 'Actualizar Firma'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DigitalSignatureView;
