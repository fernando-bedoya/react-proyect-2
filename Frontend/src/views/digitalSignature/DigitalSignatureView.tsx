/**
 * DigitalSignatureView - Vista con GenericTable y soporte de temas
 * 
 * Permite subir firmas digitales (imágenes) al servidor
 * Guarda en: Backend/app/static/uploads/digital-signatures/
 * Usa GenericTable para aprovechar los colores del tema (Bootstrap/Tailwind/Material)
 */

import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner, Image } from 'react-bootstrap';
import { Plus, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { userService } from '../../services/userService';
import GenericTable from '../../components/GenericTable';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: number;
  name: string;
  email: string;
}

// Interfaz que coincide con el modelo del backend (digital_signature.py)
// El backend usa el campo "photo" para almacenar la ruta de la imagen
interface DigitalSignature {
  id?: number;
  user_id: number;
  photo: string; // Ruta relativa: "digital-signatures/uuid_filename.png"
  created_at?: string;
  updated_at?: string;
  user?: User;
}

const DigitalSignatureView: React.FC = () => {
  // Hook del tema para colores dinámicos (Bootstrap=verde, Tailwind=azul, Material=amarillo)
  const { designLibrary } = useTheme();
  
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Colores del tema actual para botones y headers
  const themeColors = {
    bootstrap: {
      primary: 'success', // Verde
      headerBg: 'bg-success',
      buttonClass: 'btn-success'
    },
    tailwind: {
      primary: 'primary', // Azul
      headerBg: 'bg-primary', 
      buttonClass: 'btn-primary'
    },
    material: {
      primary: 'warning', // Amarillo
      headerBg: 'bg-warning',
      buttonClass: 'btn-warning'
    }
  };

  const currentTheme = themeColors[designLibrary as keyof typeof themeColors] || themeColors.bootstrap;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar firmas
      const signaturesResponse = await axios.get(`${API_URL}/digital-signatures/`);
      const signaturesData = signaturesResponse.data;
      
      // Cargar usuarios
      const usersData = await userService.getUsers();
      
      // Combinar datos
      const signaturesWithUsers = signaturesData.map((sig: any) => ({
        ...sig,
        user: usersData.find((u: User) => u.id === sig.user_id)
      }));
      
      setSignatures(signaturesWithUsers);
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'No se pudieron cargar las firmas digitales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (signature?: DigitalSignature) => {
    if (signature) {
      setEditingId(signature.id!);
      setSelectedUserId(signature.user_id);
      // No se puede editar el archivo, solo reemplazarlo
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedUserId(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      Swal.fire('Error', 'Debes seleccionar un usuario', 'error');
      return;
    }

    if (!selectedFile && !editingId) {
      Swal.fire('Error', 'Debes seleccionar un archivo', 'error');
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }

    try {
      if (editingId) {
        // Actualizar
        await axios.put(`${API_URL}/digital-signatures/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('¡Actualizado!', 'Firma digital actualizada correctamente', 'success');
      } else {
        // Crear
        await axios.post(`${API_URL}/digital-signatures/user/${selectedUserId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('¡Creado!', 'Firma digital creada correctamente', 'success');
      }
      
      handleCloseModal();
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al guardar la firma digital';
      Swal.fire('Error', errorMsg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar firma digital?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/digital-signatures/${id}`);
        Swal.fire('¡Eliminado!', 'Firma digital eliminada correctamente', 'success');
        loadData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la firma digital', 'error');
      }
    }
  };

  const handlePreview = (signature: DigitalSignature) => {
    // Extraemos solo el nombre del archivo de la ruta completa (digital-signatures/uuid_file.png)
    const filename = signature.photo?.split('/').pop() || '';
    setPreviewImage(`${API_URL}/digital-signatures/${filename}`);
    setShowPreviewModal(true);
  };

  const handleDownload = (signature: DigitalSignature) => {
    // Extraemos el nombre del archivo para la descarga
    const filename = signature.photo?.split('/').pop() || 'firma.png';
    const link = document.createElement('a');
    link.href = `${API_URL}/digital-signatures/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando firmas digitales...</p>
      </Container>
    );
  }

  // Preparar datos para GenericTable
  const tableData = signatures.map(sig => ({
    id: sig.id,
    user_info: `${sig.user?.name || `Usuario #${sig.user_id}`} (${sig.user?.email || 'N/A'})`,
    filename: sig.photo?.split('/').pop() || 'N/A',
    created_at: sig.created_at ? new Date(sig.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A',
    // Datos originales para acciones
    _original: sig
  }));

  // Columnas simples (solo strings)
  const columns = ['id', 'user_info', 'filename', 'created_at'];

  // Acciones de la tabla
  const actions = [
    {
      name: 'view',
      label: 'Ver',
      variant: 'info' as const,
      icon: 'view' as const
    },
    {
      name: 'edit',
      label: 'Editar',
      variant: currentTheme.primary as 'primary' | 'success' | 'warning',
      icon: 'edit' as const
    },
    {
      name: 'delete',
      label: 'Eliminar',
      variant: 'danger' as const,
      icon: 'delete' as const
    }
  ];

  // Manejador de acciones
  const handleAction = (actionName: string, row: any) => {
    const signature = row._original;
    
    switch (actionName) {
      case 'view':
        handlePreview(signature);
        break;
      case 'edit':
        handleOpenModal(signature);
        break;
      case 'delete':
        handleDelete(signature.id);
        break;
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Header con colores del tema actual */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📝 Firmas Digitales</h2>
          <p className="text-muted">Gestión de firmas digitales de usuarios</p>
        </div>
        <Button 
          variant={currentTheme.primary} 
          onClick={() => handleOpenModal()}
          className="shadow-sm"
        >
          <Plus size={20} className="me-2" />
          Nueva Firma
        </Button>
      </div>

      {/* Tabla genérica con soporte de temas */}
      {loading ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant={currentTheme.primary} />
          <p className="mt-3">Cargando firmas digitales...</p>
        </div>
      ) : signatures.length === 0 ? (
        <Alert variant="info">
          📭 No hay firmas digitales registradas
        </Alert>
      ) : (
        <GenericTable
          data={tableData}
          columns={columns}
          columnLabels={{
            id: 'ID',
            user_info: 'Usuario',
            filename: 'Archivo',
            created_at: 'Fecha de Creación'
          }}
          actions={actions}
          onAction={handleAction}
        />
      )}

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Actualizar Firma Digital' : 'Nueva Firma Digital'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Usuario *</Form.Label>
              <Form.Select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                required
                disabled={!!editingId}
              >
                <option value="">-- Seleccionar usuario --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Selecciona el usuario propietario de la firma
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Archivo de Imagen {!editingId && '*'}</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingId}
              />
              <Form.Text className="text-muted">
                Selecciona una imagen (PNG, JPG, etc.). Se guardará en: Backend/app/static/uploads/digital-signatures/
              </Form.Text>
            </Form.Group>

            {previewUrl && (
              <div className="mb-3">
                <Form.Label>Vista Previa:</Form.Label>
                <div className="border p-2 text-center">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fluid
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}

            {!editingId && (
              <Alert variant="info">
                <strong>ℹ️ Información:</strong> El archivo se subirá automáticamente al servidor
                y se guardará en la carpeta de firmas digitales del backend.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              <Upload size={16} className="me-2" />
              {editingId ? 'Actualizar' : 'Subir Firma'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de vista previa */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Vista Previa de Firma Digital</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image 
            src={previewImage} 
            alt="Preview" 
            fluid
            style={{ maxHeight: '600px' }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DigitalSignatureView;
