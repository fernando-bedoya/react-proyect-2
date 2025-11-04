import React, { useState, useEffect } from "react";
import { Shield, Save, RefreshCw } from "lucide-react";
import ThemeSelector from "../../components/ThemeSelector";
import Swal from "sweetalert2";
import rolePermissionService from "../../services/rolePermissionService";
import { permissionService } from "../../services/permissionService";
import roleService from "../../services/roleService";
import { Permission } from "../../models/Permission";
import { Role } from "../../models/Role";

/**
 * Administrator - Permissions
 * Página para asignar permisos a roles mediante checkboxes
 */
const AdministratorPermissions: React.FC = () => {
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

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-meta-3">
                            <Shield className="inline mr-2" size={28} />
                            Administrador de Permisos
                        </h2>
                        <p className="text-muted mb-0">
                            Asigne permisos a los roles del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <ThemeSelector />
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Actualizar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedRole}
                            className="inline-flex items-center gap-2 bg-meta-3 text-white px-3 py-2 rounded text-sm hover:bg-meta-3/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded shadow-sm">
                    <div className="flex items-center">
                        <strong className="mr-2">✓</strong>
                        {successMessage}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded shadow-sm">
                    <div className="flex items-center">
                        <strong className="mr-2">✕</strong>
                        {error}
                    </div>
                </div>
            )}

            {/* Role Selector */}
            <div className="bg-white dark:bg-boxdark rounded shadow-sm border p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Rol</h3>
                <div className="flex items-center gap-4">
                    <label htmlFor="role-select" className="text-sm font-medium min-w-24">
                        Rol:
                    </label>
                    <select
                        id="role-select"
                        value={selectedRole || ''}
                        onChange={handleRoleChange}
                        className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                    >
                        <option value="">-- Seleccione un rol --</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name} {role.description ? `- ${role.description}` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedRole && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Asignando permisos al rol:</strong> {selectedRoleName}
                    </div>
                )}
            </div>

            {/* Permissions Grid */}
            {selectedRole && (
                <div className="bg-white dark:bg-boxdark rounded shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Permisos Disponibles</h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="mt-3 text-muted">Cargando permisos...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([entity, perms]) => (
                                <div key={entity} className="border rounded p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-md font-semibold text-primary">{entity}</h4>
                                        <button
                                            onClick={() => handleSelectAllInEntity(entity)}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {perms.every(p => selectedPermissions.includes(p.id as number))
                                                ? 'Deseleccionar todos'
                                                : 'Seleccionar todos'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {perms.map(perm => (
                                            <label
                                                key={perm.id}
                                                className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.id as number)}
                                                    onChange={() => handlePermissionToggle(perm.id as number)}
                                                    className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {perm.method?.toUpperCase()} {perm.url}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        ID: {perm.id}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {Object.keys(groupedPermissions).length === 0 && (
                                <div className="text-center py-8 text-muted">
                                    No hay permisos disponibles para asignar
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    {selectedRole && !loading && (
                        <div className="mt-6 p-4 bg-gray-50 rounded">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium">Permisos seleccionados:</span>
                                <span className="text-primary font-bold text-lg">
                                    {selectedPermissions.length} / {permissions.length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!selectedRole && !loading && (
                <div className="bg-white dark:bg-boxdark rounded shadow-sm border p-12 text-center">
                    <Shield size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-muted text-lg">
                        Seleccione un rol para comenzar a asignar permisos
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdministratorPermissions;
