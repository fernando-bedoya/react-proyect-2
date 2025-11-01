import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useUsersAndRoles } from '../../hooks/useUsersAndRoles';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const AlertMui = React.forwardRef(function Alert(props: any, ref: any) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const UpdateUserRoles: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles, getUserRoles, assignRoles, loading: loadingHook } = useUsersAndRoles();

  const [user, setUser] = useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!id) throw new Error('ID de usuario no provisto');
        const userData = await userService.getUserById(Number(id));
        if (!mounted) return;
        setUser(userData);

        // cargar roles asignados al usuario
        const urs = await getUserRoles(Number(id));
        if (!mounted) return;
        const assignedRoleIds = (urs || []).map((u: any) => u.roleId ?? u.role_id ?? (u.role && (u.role as any).id) ?? null).filter((r: any) => r !== null).map((r: any) => Number(r));

        // mapear a objetos role existentes
        const selected = roles.filter((r: any) => assignedRoleIds.includes(Number(r.id)));
        setSelectedRoles(selected);
      } catch (err) {
        console.error('Error cargando datos para actualizar roles:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, roles, getUserRoles]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const roleIds = selectedRoles.map((r: any) => Number(r.id)).filter((n: number) => !Number.isNaN(n));
      // assignRoles will create relationships for each role
      await assignRoles(Number(user.id), roleIds);
      setSnack({ open: true, message: 'Roles asignados correctamente', severity: 'success' });
      setTimeout(() => navigate('/user-roles'), 1200);
    } catch (err: any) {
      console.error(err);
      let message = 'Error al asignar roles';
      try {
        if (err?.response?.data) message = err.response.data.message || JSON.stringify(err.response.data);
        else if (err?.message) message = err.message;
      } catch (e) {
        // ignore
      }
      setSnack({ open: true, message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingHook) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Cargando...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">Usuario no encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={() => navigate('/user-roles')}>
                <ArrowLeft size={16} /> Volver
              </button>
              <div>
                <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Editar Roles de {user?.name || user?.email}</h2>
                <p className="text-muted mb-0">Seleccione los roles que desea asignar al usuario</p>
              </div>
            </div>
            {/* espacio para acciones */}
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Autocomplete
                  multiple
                  options={roles}
                  getOptionLabel={(r: any) => r.name || String(r.id)}
                  value={selectedRoles}
                  onChange={(_, value) => setSelectedRoles(value)}
                  renderTags={(value: any[], getTagProps) => value.map((option: any, index: number) => (
                    <Chip label={option.name || `#${option.id}`} {...getTagProps({ index })} key={option.id} />
                  ))}
                  renderInput={(params) => <TextField {...params} label="Roles" placeholder="Seleccionar roles" />}
                  isOptionEqualToValue={(a: any, b: any) => Number(a.id) === Number(b.id)}
                />

                <div className="d-flex gap-2">
                  <Button variant="contained" color="warning" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={18} /> : 'Guardar'}
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/user-roles')}>Cancelar</Button>
                </div>
              </Box>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <AlertMui onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity}>
          {snack.message}
        </AlertMui>
      </Snackbar>
    </Container>
  );
};

export default UpdateUserRoles;
