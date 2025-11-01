// DigitalSignatureView.jsx - Vista mejorada con componentes genéricos
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Plus, RefreshCw } from 'lucide-react';
import GenericTable from '../../components/GenericTable';
import GenericModal from '../../components/GenericModal';
import ThemeSelector from '../../components/ThemeSelector';
import { getAll } from '../../services/baseService';
import Swal from 'sweetalert2';

const DigitalSignatureView = () => {
  const [signatures, setSignatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [signaturesData, usersData] = await Promise.all([
        getAll('digital-signatures'),
        getAll('users')
      ]);
      setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = async (actionName, signature) => {
    if (actionName === 'edit') {
      Swal.fire({
        title: 'Función en desarrollo',
        text: 'La edición de firmas digitales estará disponible próximamente',
        icon: 'info',
        confirmButtonColor: '#10b981'
      });
    } else if (actionName === 'delete') {
      const result = await Swal.fire({
        title: '¿Eliminar firma digital?',
        text: `Se eliminará la firma de ${getUserName(signature.user_id)}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Función en desarrollo',
          text: 'La eliminación de firmas digitales estará disponible próximamente',
          icon: 'info',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleCreate = () => {
    Swal.fire({
      title: 'Función en desarrollo',
      text: 'La creación de firmas digitales estará disponible próximamente',
      icon: 'info',
      confirmButtonColor: '#10b981'
    });
  };

  // Preparar datos para la tabla
  const tableData = signatures.map(sig => ({
    ...sig,
    user_name: getUserName(sig.user_id),
    created_at_formatted: formatDate(sig.created_at),
    filename_display: sig.filename || 'Sin archivo'
  }));

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h2 fw-bold mb-2" style={{ 
                color: '#065f46',
                fontFamily: '"Segoe UI", sans-serif',
                letterSpacing: '-0.5px'
              }}>
                📝 Firmas Digitales
              </h2>
              <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
                Gestión de firmas digitales de usuarios
                <Badge 
                  bg="success" 
                  className="ms-2"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {signatures.length} firmas
                </Badge>
              </p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <ThemeSelector />
              <Button 
                variant="outline-success"
                onClick={handleRefresh}
                disabled={loading}
                className="d-flex align-items-center gap-2"
                style={{
                  borderWidth: '2px',
                  borderColor: '#10b981',
                  color: '#059669',
                  fontWeight: '700',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1fae5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <RefreshCw size={18} />
                Actualizar
              </Button>
              <Button 
                variant="success"
                onClick={handleCreate}
                className="d-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  fontWeight: '800',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
              >
                <Plus size={20} />
                Nueva Firma
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError('')}
          style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            color: '#991b1b',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            marginBottom: '24px'
          }}
        >
          <Alert.Heading as="h6" style={{ fontWeight: '800', color: '#991b1b' }}>
            ⚠️ Error
          </Alert.Heading>
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          {loading ? (
            <div 
              className="text-center py-5"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
                borderRadius: '20px',
                border: '4px solid #10b981',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Spinner 
                animation="border" 
                variant="success"
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderWidth: '4px'
                }}
              />
              <p className="mt-4" style={{ 
                color: '#059669',
                fontSize: '1.1rem',
                fontWeight: '700'
              }}>
                ⏳ Cargando firmas digitales...
              </p>
            </div>
          ) : (
            <GenericTable
              data={tableData}
              columns={["id", "user_name", "filename_display", "created_at_formatted"]}
              actions={[
                { name: "edit", label: "Editar", icon: "edit", variant: "outline-primary" },
                { name: "delete", label: "Eliminar", icon: "delete", variant: "outline-danger" }
              ]}
              onAction={handleAction}
              striped
              hover
              responsive
              emptyMessage="📭 No hay firmas digitales registradas"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DigitalSignatureView;
