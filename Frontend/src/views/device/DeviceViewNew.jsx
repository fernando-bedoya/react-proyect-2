// DeviceView.jsx - Vista mejorada con componentes genéricos
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Plus, RefreshCw } from 'lucide-react';
import GenericTable from '../../components/GenericTable';
import ThemeSelector from '../../components/ThemeSelector';
import { getAll } from '../../services/baseService';
import Swal from 'sweetalert2';

const DeviceView = () => {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [devicesData, usersData] = await Promise.all([
        getAll('devices'),
        getAll('users')
      ]);
      setDevices(Array.isArray(devicesData) ? devicesData : []);
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

  const handleAction = async (actionName, device) => {
    if (actionName === 'edit') {
      Swal.fire({
        title: 'Función en desarrollo',
        text: 'La edición de dispositivos estará disponible próximamente',
        icon: 'info',
        confirmButtonColor: '#10b981'
      });
    } else if (actionName === 'delete') {
      const result = await Swal.fire({
        title: '¿Eliminar dispositivo?',
        text: `Se eliminará el dispositivo de ${getUserName(device.user_id)}`,
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
          text: 'La eliminación de dispositivos estará disponible próximamente',
          icon: 'info',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

  const tableData = devices.map(dev => ({
    ...dev,
    user_name: getUserName(dev.user_id)
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
                📱 Dispositivos
              </h2>
              <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
                Gestión de dispositivos de usuarios
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
                  {devices.length} dispositivos
                </Badge>
              </p>
            </div>
            <div className="d-flex gap-3 align-items-center">
              <ThemeSelector />
              <Button 
                variant="outline-success"
                onClick={loadData}
                disabled={loading}
                className="d-flex align-items-center gap-2"
                style={{
                  borderWidth: '2px',
                  borderColor: '#10b981',
                  color: '#059669',
                  fontWeight: '700',
                  padding: '10px 20px',
                  borderRadius: '10px'
                }}
              >
                <RefreshCw size={18} />
                Actualizar
              </Button>
              <Button 
                variant="success"
                onClick={() => Swal.fire('Función en desarrollo', 'Próximamente', 'info')}
                className="d-flex align-items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  fontWeight: '800',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}
              >
                <Plus size={20} />
                Nuevo Dispositivo
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-4">⏳ Cargando dispositivos...</p>
            </div>
          ) : (
            <GenericTable
              data={tableData}
              columns={["id", "user_name", "name", "type"]}
              actions={[
                { name: "edit", label: "Editar", icon: "edit", variant: "outline-primary" },
                { name: "delete", label: "Eliminar", icon: "delete", variant: "outline-danger" }
              ]}
              onAction={handleAction}
              striped
              hover
              responsive
              emptyMessage="📭 No hay dispositivos registrados"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DeviceView;
