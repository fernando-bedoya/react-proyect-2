// SecurityQuestionView.jsx - Vista mejorada con componentes genéricos
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Plus, RefreshCw } from 'lucide-react';
import GenericTable from '../../components/GenericTable';
import ThemeSelector from '../../components/ThemeSelector';
import { getAll } from '../../services/baseService';
import Swal from 'sweetalert2';

const SecurityQuestionView = () => {
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('security-questions');
      setSecurityQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar preguntas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionName, question) => {
    if (actionName === 'edit') {
      Swal.fire({
        title: 'Función en desarrollo',
        text: 'La edición de preguntas de seguridad estará disponible próximamente',
        icon: 'info',
        confirmButtonColor: '#10b981'
      });
    } else if (actionName === 'delete') {
      const result = await Swal.fire({
        title: '¿Eliminar pregunta?',
        text: `Se eliminará la pregunta: "${question.text}"`,
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
          text: 'La eliminación de preguntas estará disponible próximamente',
          icon: 'info',
          confirmButtonColor: '#10b981'
        });
      }
    }
  };

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
                🔒 Preguntas de Seguridad
              </h2>
              <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
                Gestión del catálogo de preguntas de seguridad
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
                  {securityQuestions.length} preguntas
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
                Nueva Pregunta
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
            fontWeight: '600'
          }}
        >
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          {loading ? (
            <div 
              className="text-center py-5" 
              style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
            >
              <Spinner 
                animation="border" 
                variant="success"
                style={{ width: '3rem', height: '3rem' }}
              />
              <p className="mt-4 fw-bold" style={{ color: '#065f46', fontSize: '1.1rem' }}>
                ⏳ Cargando preguntas de seguridad...
              </p>
            </div>
          ) : (
            <GenericTable
              data={securityQuestions}
              columns={["id", "text"]}
              actions={[
                { name: "edit", label: "Editar", icon: "edit", variant: "outline-primary" },
                { name: "delete", label: "Eliminar", icon: "delete", variant: "outline-danger" }
              ]}
              onAction={handleAction}
              striped
              hover
              responsive
              emptyMessage="📭 No hay preguntas de seguridad registradas en el sistema"
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SecurityQuestionView;
