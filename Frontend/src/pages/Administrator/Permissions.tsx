import React, { useEffect, useState } from 'react';
import { Shield, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import rolePermissionService from '../../services/rolePermissionService';
import { permissionService } from '../../services/permissionService';
import roleService from '../../services/roleService';
import { Permission } from '../../models/Permission';
import { Role } from '../../models/Role';
import { useTheme } from '../../context/ThemeContext';

// Imports condicionales según el tema
import { Container, Row, Col, Card, Form, Button, Spinner, Badge, Alert, Accordion } from 'react-bootstrap';

/**
 * Administrator - Permissions
 * Página para asignar permisos a roles mediante checkboxes
 */
const AdministratorPermissions: React.FC = () => {
    const { designLibrary } = useTheme();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Agrupar permisos por entidad
    const [groupedPermissions, setGroupedPermissions] = useState<{ [entity: string]: Permission[] }>({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole);
        } else {
            setSelectedPermissions([]);
        }
    }, [selectedRole]);

    useEffect(() => {
        // Agrupar permisos por entidad
        const grouped: { [entity: string]: Permission[] } = {};
        permissions.forEach(perm => {
            const entity = perm.entity || 'General';
            if (!grouped[entity]) {
                grouped[entity] = [];
            }
            grouped[entity].push(perm);
        });
        setGroupedPermissions(grouped);
    }, [permissions]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [rolesData, permissionsData] = await Promise.all([
                roleService.getRoles(),
                permissionService.getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error al cargar los datos. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRolePermissions = async (roleId: number) => {
        try {
            const rolePermissions = await rolePermissionService.getPermissionsByRoleId(roleId);
            const permissionIds = rolePermissions.map(rp => rp.permission_id as number);
            setSelectedPermissions(permissionIds);
        } catch (err) {
            console.error("Error fetching role permissions:", err);
            setError("Error al cargar permisos del rol.");
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = e.target.value ? Number(e.target.value) : null;
        setSelectedRole(roleId);
    };

    const handlePermissionToggle = (permissionId: number) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSelectAllInEntity = (entity: string) => {
        const entityPerms = groupedPermissions[entity] || [];
        const entityPermIds = entityPerms.map(p => p.id as number);
        
        // Check if all are selected
        const allSelected = entityPermIds.every(id => selectedPermissions.includes(id));
        
        if (allSelected) {
            // Deselect all
            setSelectedPermissions(prev => prev.filter(id => !entityPermIds.includes(id)));
        } else {
            // Select all
            setSelectedPermissions(prev => {
                const newSelection = [...prev];
                entityPermIds.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                return newSelection;
            });
        }
    };

    const handleSave = async () => {
        if (!selectedRole) {
            Swal.fire({
                title: "Error",
                text: "Por favor seleccione un rol primero",
                icon: "warning",
                confirmButtonColor: "#10b981"
            });
            return;
        }

        try {
            setSaving(true);
            setError(null);

            await rolePermissionService.syncRolePermissions(selectedRole, selectedPermissions);

            setSuccessMessage("Permisos actualizados correctamente");
            setTimeout(() => setSuccessMessage(null), 3000);

            Swal.fire({
                title: "Éxito",
                text: "Los permisos se han asignado correctamente al rol",
                icon: "success",
                confirmButtonColor: "#10b981",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (err: any) {
            console.error("Error saving permissions:", err);
            const errorMessage = err.response?.data?.error || "Error al guardar los permisos";
            setError(errorMessage);

            Swal.fire({
                title: "Error",
                text: errorMessage,
                icon: "error",
                confirmButtonColor: "#10b981"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRefresh = () => {
        setSuccessMessage(null);
        setError(null);
        fetchInitialData();
    };

    const selectedRoleName = roles.find(r => r.id === selectedRole)?.name || '';

    // Clases condicionales según el tema
    const containerClass = designLibrary === 'bootstrap' 
        ? 'container-fluid py-4' 
        : 'w-full px-4 py-6 max-w-7xl mx-auto';
    
    const headerClass = designLibrary === 'bootstrap'
        ? 'h2 fw-bold mb-2 text-black'
        : 'text-3xl font-bold mb-2 text-black';
    
    const buttonBaseClass = designLibrary === 'bootstrap'
        ? 'd-flex align-items-center gap-2'
        : 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors';
    
    const buttonPrimaryClass = designLibrary === 'bootstrap'
        ? 'btn btn-dark'
        : 'bg-black text-white hover:bg-gray-800';
    
    const buttonOutlineClass = designLibrary === 'bootstrap'
        ? 'btn btn-outline-dark'
        : 'border border-black text-black hover:bg-gray-100';

    return (
        <div className={containerClass}>
            {/* Header */}
            <div className={designLibrary === 'bootstrap' ? 'row mb-4' : 'mb-6'}>
                <div className={designLibrary === 'bootstrap' ? 'col' : 'w-full'}>
                    <div className={designLibrary === 'bootstrap' ? 'd-flex justify-content-between align-items-center' : 'flex justify-between items-center'}>
                        <div>
                            <h2 className={headerClass}>
                                <Shield className={designLibrary === 'bootstrap' ? 'me-2' : 'inline-block mr-2'} size={32} style={{ verticalAlign: 'middle' }} />
                                🛡️ Administrador de Permisos
                            </h2>
                            <p className={designLibrary === 'bootstrap' ? 'text-muted mb-0' : 'text-gray-600'}>
                                Asigne permisos a los roles del sistema
                            </p>
                        </div>
                        <div className={designLibrary === 'bootstrap' ? 'd-flex gap-2' : 'flex gap-2'}>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className={`${buttonBaseClass} ${buttonOutlineClass}`}
                            >
                                <RefreshCw size={16} />
                                Actualizar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !selectedRole}
                                className={`${buttonBaseClass} ${buttonPrimaryClass}`}
                            >
                                {saving ? (
                                    <>
                                        {designLibrary === 'bootstrap' ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        )}
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Guardar Cambios</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className={designLibrary === 'bootstrap' 
                    ? 'alert alert-success alert-dismissible fade show mb-3' 
                    : 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4'
                }>
                    <strong>✓</strong> {successMessage}
                    <button
                        type="button"
                        onClick={() => setSuccessMessage(null)}
                        className={designLibrary === 'bootstrap' ? 'btn-close' : 'absolute top-0 bottom-0 right-0 px-4 py-3'}
                    >
                        {designLibrary === 'tailwind' && <span className="text-xl">&times;</span>}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className={designLibrary === 'bootstrap' 
                    ? 'alert alert-danger alert-dismissible fade show mb-3' 
                    : 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
                }>
                    <strong>✕</strong> {error}
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className={designLibrary === 'bootstrap' ? 'btn-close' : 'absolute top-0 bottom-0 right-0 px-4 py-3'}
                    >
                        {designLibrary === 'tailwind' && <span className="text-xl">&times;</span>}
                    </button>
                </div>
            )}

            {/* Role Selector */}
            <div className={designLibrary === 'bootstrap' 
                ? 'card shadow-sm mb-4' 
                : 'bg-white shadow-sm rounded-lg border border-gray-200 mb-4'
            }>
                <div className={designLibrary === 'bootstrap' ? 'card-body' : 'p-6'}>
                    <h3 className={designLibrary === 'bootstrap' 
                        ? 'h5 fw-semibold mb-3 text-dark' 
                        : 'text-xl font-semibold mb-3 text-black'
                    }>
                        Seleccionar Rol
                    </h3>
                    <div className={designLibrary === 'bootstrap' ? 'row' : 'w-full md:w-2/3'}>
                        <div className={designLibrary === 'bootstrap' ? 'col-md-8' : 'w-full'}>
                            <div className="mb-3">
                                <label className={designLibrary === 'bootstrap' ? 'form-label fw-medium' : 'block text-sm font-medium text-gray-700 mb-2'}>
                                    Rol *
                                </label>
                                <select
                                    value={selectedRole || ''}
                                    onChange={handleRoleChange}
                                    disabled={loading}
                                    className={designLibrary === 'bootstrap' 
                                        ? 'form-select form-select-lg' 
                                        : 'block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black'
                                    }
                                >
                                    <option value="">-- Seleccione un rol --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name} {role.description ? `- ${role.description}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {selectedRole && (
                        <div className={designLibrary === 'bootstrap' 
                            ? 'alert alert-dark mt-3 mb-0' 
                            : 'bg-gray-100 border border-gray-300 text-gray-900 px-4 py-3 rounded mt-3'
                        }>
                            <strong>Asignando permisos al rol:</strong> {selectedRoleName}
                        </div>
                    )}
                </div>
            </div>

            {/* Permissions Grid */}
            {selectedRole && (
                <div className={designLibrary === 'bootstrap' 
                    ? 'card shadow-sm' 
                    : 'bg-white shadow-sm rounded-lg border border-gray-200'
                }>
                    <div className={designLibrary === 'bootstrap' ? 'card-body' : 'p-6'}>
                        <h3 className={designLibrary === 'bootstrap' 
                            ? 'h5 fw-semibold mb-4 text-dark' 
                            : 'text-xl font-semibold mb-4 text-black'
                        }>
                            Permisos Disponibles
                        </h3>

                        {loading ? (
                            <div className={designLibrary === 'bootstrap' ? 'text-center py-5' : 'text-center py-10'}>
                                {designLibrary === 'bootstrap' ? (
                                    <>
                                        <Spinner animation="border" variant="dark" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </Spinner>
                                        <p className="mt-3 text-muted">Cargando permisos...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                                        <p className="mt-3 text-gray-600">Cargando permisos...</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Accordion defaultActiveKey="0" className="mb-3">
                                    {Object.entries(groupedPermissions).map(([entity, perms], index) => (
                                        <Accordion.Item eventKey={String(index)} key={entity}>
                                            <Accordion.Header>
                                                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                                    <span className="fw-semibold text-dark">{entity}</span>
                                                    <Badge bg="dark" pill>{perms.length}</Badge>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <div className="d-flex justify-content-end mb-3">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={() => handleSelectAllInEntity(entity)}
                                                        className="text-dark text-decoration-none"
                                                    >
                                                        {perms.every(p => selectedPermissions.includes(p.id as number))
                                                            ? 'Deseleccionar todos'
                                                            : 'Seleccionar todos'}
                                                    </Button>
                                                </div>
                                                <Row className="g-3">
                                                    {perms.map(perm => (
                                                        <Col key={perm.id} xs={12} md={6} lg={4}>
                                                            <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                                                <Card.Body className="p-3">
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        id={`perm-${perm.id}`}
                                                                        checked={selectedPermissions.includes(perm.id as number)}
                                                                        onChange={() => handlePermissionToggle(perm.id as number)}
                                                                        label={
                                                                            <div>
                                                                                <div className="fw-medium small">
                                                                                    <Badge bg="secondary" className="me-2">{perm.method?.toUpperCase()}</Badge>
                                                                                    {perm.url}
                                                                                </div>
                                                                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                                    ID: {perm.id}
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    />
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>

                                {Object.keys(groupedPermissions).length === 0 && (
                                    <Alert variant="warning" className="text-center">
                                        No hay permisos disponibles para asignar
                                    </Alert>
                                )}

                                {/* Summary */}
                                {selectedRole && !loading && selectedPermissions.length > 0 && (
                                    <div className={designLibrary === 'bootstrap' 
                                        ? 'card bg-light mt-3' 
                                        : 'bg-gray-100 rounded-lg border border-gray-200 mt-3'
                                    }>
                                        <div className={designLibrary === 'bootstrap' 
                                            ? 'card-body d-flex justify-content-between align-items-center' 
                                            : 'p-4 flex justify-between items-center'
                                        }>
                                            <span className={designLibrary === 'bootstrap' ? 'fw-medium' : 'font-medium'}>
                                                Permisos seleccionados:
                                            </span>
                                            <span className={designLibrary === 'bootstrap' 
                                                ? 'badge bg-dark rounded-pill' 
                                                : 'bg-black text-white px-3 py-1 rounded-full text-sm'
                                            } style={{ fontSize: '1rem' }}>
                                                {selectedPermissions.length} / {permissions.length}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {!selectedRole && !loading && (
                <div className={designLibrary === 'bootstrap' 
                    ? 'card shadow-sm text-center' 
                    : 'bg-white shadow-sm rounded-lg border border-gray-200 text-center'
                }>
                    <div className={designLibrary === 'bootstrap' ? 'card-body py-5' : 'p-12'}>
                        <Shield size={64} className={designLibrary === 'bootstrap' ? 'text-secondary mb-3' : 'text-gray-400 mx-auto mb-4'} />
                        <p className={designLibrary === 'bootstrap' ? 'text-muted fs-5 mb-0' : 'text-gray-600 text-lg'}>
                            Seleccione un rol para comenzar a asignar permisos
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdministratorPermissions;
