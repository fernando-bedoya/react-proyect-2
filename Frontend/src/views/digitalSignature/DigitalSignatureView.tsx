/**
 * DigitalSignatureView - Vista personalizada con subida de archivos
 * 
 * Permite subir firmas digitales (imágenes) al servidor
 * Guarda en: Backend/app/static/uploads/digital-signatures/
 */

import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Spinner, Image } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Upload, Eye, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { userService } from '../../services/userService';

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

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📝 Firmas Digitales</h2>
          <p className="text-muted">Gestión de firmas digitales de usuarios</p>
        </div>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2" />
          Nueva Firma
        </Button>
      </div>

      {signatures.length === 0 ? (
        <Alert variant="info">
          📭 No hay firmas digitales registradas
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Archivo</th>
                  <th>Vista Previa</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {signatures.map(signature => (
                  <tr key={signature.id}>
                    <td>{signature.id}</td>
                    <td>
                      <div>
                        <strong>{signature.user?.name || `Usuario #${signature.user_id}`}</strong>
                        <br />
                        <small className="text-muted">{signature.user?.email}</small>
                      </div>
                    </td>
                    <td>
                      {/* El backend devuelve la ruta completa en el campo "photo", extraemos solo el nombre del archivo */}
                      <code>{signature.photo?.split('/').pop() || 'N/A'}</code>
                    </td>
                    <td>
                      {/* El backend sirve las imágenes desde /api/digital-signatures/{filename} */}
                      <Image 
                        src={`${API_URL}/digital-signatures/${signature.photo?.split('/').pop()}`}
                        alt="Preview"
                        thumbnail
                        style={{ width: '80px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handlePreview(signature)}
                        onError={(e) => {
                          // Si la imagen no se carga, mostramos un placeholder
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="50"%3E%3Crect fill="%23ddd" width="80" height="50"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td>
                      {signature.created_at ? (
                        <small>
                          {new Date(signature.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => handlePreview(signature)}
                          title="Ver"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleDownload(signature)}
                          title="Descargar"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleOpenModal(signature)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(signature.id!)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
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
