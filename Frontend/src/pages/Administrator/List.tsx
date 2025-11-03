import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Plus } from "lucide-react";
import Swal from "sweetalert2";
import GenericTableTailwind from "../../components/tailwindGenerics/GenericTableTailwind";
import rolePermissionService from "../../services/rolePermissionService";
import { RolePermission } from "../../models/RolePermission";

/**
 * Administrator List
 * Lista todas las relaciones Role-Permission del sistema
 */
const AdministratorList: React.FC = () => {
    const navigate = useNavigate();
    const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRolePermissions();
    }, []);

    const fetchRolePermissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await rolePermissionService.getRolePermissions();
            setRolePermissions(data);
        } catch (err) {
            console.error("Error fetching role-permissions:", err);
            setError("Error al cargar las relaciones. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: RolePermission) => {
        const result = await Swal.fire({
            title: "¿Está seguro?",
            html: `¿Desea eliminar esta asignación de permiso?<br/><small>Rol ID: ${item.role_id} | Permiso ID: ${item.permission_id}</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                const success = await rolePermissionService.deleteRolePermission(item.id as string);
                if (success) {
                    Swal.fire({
                        title: "Eliminado",
                        text: "La asignación se eliminó correctamente",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                    fetchRolePermissions();
                }
            } catch (err) {
                console.error("Error deleting role-permission:", err);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo eliminar la asignación",
                    icon: "error"
                });
            }
        }
    };

    const handleAction = (action: string, item: RolePermission) => {
        if (action === "delete") {
            handleDelete(item);
        }
    };

    const columns = [
        // Ocultar el atributo `id` largo
        { key: "id", label: "ID", hidden: true },
        { 
            key: "role_id", 
            label: "Rol",
            render: (row: RolePermission) => {
                if (row.role) {
                    return `${row.role.name} (ID: ${row.role_id})`; // Mostrar el nombre y el ID del rol
                }
                return `${row.role_id}`; // Mostrar solo el ID si no hay nombre
            }
        },
        { 
            key: "permission_id", 
            label: "Permiso",
            render: (row: RolePermission) => {
                if (row.permission) {
                    return `${row.permission.method?.toUpperCase()} ${row.permission.url} (ID: ${row.permission_id})`; // Mostrar el permiso y su ID
                }
                return `ID: ${row.permission_id}`; // Mostrar solo el ID si no hay detalles
            }
        },
        {
            key: "created_at",
            label: "Fecha Creación",
            render: (row: RolePermission) => {
                if (!row.created_at) return "-";
                const date = typeof row.created_at === "string" ? new Date(row.created_at) : row.created_at;
                return date.toLocaleString();
            }
        }
    ];

    const visibleColumns = columns.filter(column => column.key !== "id"); // Excluir la columna `id` antes de pasarla al componente

    const actions = [
        {
            name: "delete",
            label: "Eliminar",
            variant: "danger" as const
        }
    ];

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
                            Lista de asignaciones de permisos a roles
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/administrator/permissions")}
                        className="inline-flex items-center gap-2 bg-meta-3 text-white px-4 py-2 rounded text-sm hover:bg-meta-3/90 transition-colors"
                    >
                        <Plus size={18} />
                        Asignar Permisos
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded shadow-sm">
                    <div className="flex items-center">
                        <strong className="mr-2">✕</strong>
                        {error}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-boxdark rounded shadow-sm border">
                {loading ? (
                    <div className="text-center py-12">
                        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto inline-block" />
                        <p className="mt-3 text-muted">Cargando...</p>
                    </div>
                ) : (
                    <GenericTableTailwind
                        data={rolePermissions}
                        columns={visibleColumns} // Usar las columnas visibles
                        actions={actions}
                        onAction={handleAction}
                        striped
                        hover
                        responsive
                        emptyMessage="No hay asignaciones de permisos registradas"
                    />
                )}
            </div>

            {/* Info Card */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Información</h3>
                <p className="text-sm text-blue-700">
                    Esta lista muestra todas las relaciones entre roles y permisos del sistema. 
                    Para gestionar los permisos de un rol específico de forma más eficiente, 
                    use el botón "Asignar Permisos" que le permite seleccionar múltiples permisos 
                    mediante checkboxes.
                </p>
            </div>
        </div>
    );
};

export default AdministratorList;
