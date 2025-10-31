import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';
import Breadcrumb from '../../components/Breadcrumb';
import { passwordService } from '../../services/Password/passwordService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const ListPasswords: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    const userIdParam = params.get('userId');
    let data: any[] = [];
    if (userIdParam) {
      data = await passwordService.getPasswordsByUserId(Number(userIdParam));
    } else {
      data = await passwordService.getPasswords();
    }
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Confirmar', text: '¿Eliminar registro?', icon: 'warning', showCancelButton: true }).then(async (res) => {
      if (res.isConfirmed) {
        const ok = await passwordService.deletePassword(id);
        if (ok) {
          Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1000, showConfirmButton: false });
          load();
        } else {
          Swal.fire({ title: 'Error', text: 'No se pudo eliminar', icon: 'error' });
        }
      }
    });
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Breadcrumb pageName="Listado de Contraseñas" />
          <div className="d-flex align-items-center gap-3 mt-3">
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Contraseñas</h2>
              <p className="text-muted mb-0">Historial y gestión de contraseñas</p>
            </div>
          </div>
        </Col>
        <Col className="text-end align-self-center">
          <Button variant="success" onClick={() => navigate('/passwords/create')}>Crear nueva</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" /></div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Creada</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.id}</td>
                        <td>{it.user?.email || it.user_id}</td>
                        <td>{it.startAt ? new Date(it.startAt).toLocaleString() : '-'}</td>
                        <td>{it.endAt ? new Date(it.endAt).toLocaleString() : '-'}</td>
                        <td>{it.created_at ? new Date(it.created_at).toLocaleString() : '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-primary" onClick={() => navigate(`/passwords/update/${it.id}`)}>Editar</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(it.id)}>Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ListPasswords;
