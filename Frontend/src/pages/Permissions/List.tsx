import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
import GenericList from "../../components/GenericsMaterial/GenericList";
import GenericTableTailwind from "../../components/tailwindGenerics/GenericTableTailwind";
import GenericTableBootstrap from "../../components/GenericTable";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Permission } from "../../models/Permission";
import { permissionService } from "../../services/permissionService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListPermissions: React.FC = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [tableStyle, setTableStyle] = useLocalStorage<'tailwind' | 'bootstrap' | 'material'>('tableStyle', 'tailwind');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await permissionService.getPermissions();
            setPermissions(data);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError("Error al cargar los permisos. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, item: Permission) => {
        if (action === "view") {
            setSelectedPermission(item);
            setShowModal(true);
        } else if (action === "edit") {
            // Redirect to create page in edit mode (uses ?edit=<id>)
            navigate(`/permissions/create?edit=${item.id}`);
        } else if (action === "delete") {
            Swal.fire({
                title: "Eliminación",
                text: "¿Está seguro de querer eliminar este permiso?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#10b981",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const success = await permissionService.deletePermission(item.id!);
                    if (success) {
                        setSuccessMessage("El permiso se ha eliminado correctamente");
                        setTimeout(() => setSuccessMessage(null), 3000);
                        fetchData();
                    } else {
                        Swal.fire("Error", "No se pudo eliminar el permiso", "error");
                    }
                }
            });
        }
    };

    const handleCreateNew = () => {
        navigate('/permissions/create');
    };

    const handleRefresh = () => {
        setSuccessMessage(null);
        setError(null);
        fetchData();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPermission(null);
    };

    return (
        <div className="py-4 px-4">
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-title-sm font-bold mb-1" style={{ color: '#10b981' }}>
                            Gestión de Permisos
                        </h2>
                        <p className="text-muted mb-0">
                            Listado de permisos del sistema
                            <span className="inline-block ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">{permissions.length} permisos</span>
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="inline-flex items-center gap-1 mr-2">
                            <button
                                onClick={() => setTableStyle('tailwind')}
                                className={`px-2 py-1 text-sm rounded ${tableStyle === 'tailwind' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                title="Tailwind"
                            >
                                Tailwind
                            </button>
                            <button
                                onClick={() => setTableStyle('material')}
                                className={`px-2 py-1 text-sm rounded ${tableStyle === 'material' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                title="Material UI"
                            >
                                Material
                            </button>
                            <button
                                onClick={() => setTableStyle('bootstrap')}
                                className={`px-2 py-1 text-sm rounded ${tableStyle === 'bootstrap' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                title="Bootstrap"
                            >
                                Bootstrap
                            </button>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm"
                        >
                            <RefreshCw size={16} />
                            Actualizar
                        </button>
                        <button
                            onClick={handleCreateNew}
                            className="inline-flex items-center gap-2 bg-meta-3 text-white px-3 py-1 rounded text-sm"
                        >
                            <Plus size={18} />
                            Nuevo Permiso
                        </button>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="mb-4">
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2"><strong>✓</strong>{successMessage}</div>
                        <button className="text-green-700 text-xs underline" onClick={() => setSuccessMessage(null)}>Cerrar</button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4">
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 shadow-sm">
                        <div className="font-semibold">Error</div>
                        <div>{error}</div>
                        <div className="mt-2"><button onClick={() => setError(null)} className="text-red-600 underline text-xs">Cerrar</button></div>
                    </div>
                </div>
            )}

            <div>
                <div className="shadow-card rounded-lg bg-white dark:bg-boxdark">
                    <div className="p-0">
                        {loading ? (
                            <div className="text-center py-8">
                                <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                <p className="mt-3 text-muted">Cargando permisos...</p>
                            </div>
                        ) : (
                            <>
                                {tableStyle === 'material' && (
                                    <div className="p-3">
                                        <GenericList
                                            data={permissions as any}
                                            columns={[
                                                { key: 'id', label: 'ID' },
                                                { key: 'url', label: 'URL' },
                                                { key: 'method', label: 'Método' },
                                                { key: 'entity', label: 'Entidad' },
                                            ]}
                                            loading={loading}
                                            selectable={false}
                                            idKey="id"
                                            actions={[
                                                { name: 'view', icon: <Eye />, tooltip: 'Ver', color: 'info' },
                                                { name: 'edit', icon: <Edit />, tooltip: 'Editar', color: 'warning' },
                                                { name: 'delete', icon: <Trash2 />, tooltip: 'Eliminar', color: 'error' },
                                            ]}
                                            onAction={handleAction}
                                            emptyMessage="No hay permisos registrados en el sistema"
                                        />
                                    </div>
                                )}

                                {tableStyle === 'tailwind' && (
                                    <GenericTableTailwind
                                        data={permissions as any}
                                        columns={["id", "url", "method", "entity"]}
                                        actions={[
                                            { name: "view", label: "Ver", variant: "primary" },
                                            { name: "edit", label: "Editar", variant: "warning" },
                                            { name: "delete", label: "Eliminar", variant: "danger" },
                                        ]}
                                        onAction={handleAction}
                                        theme="tailwind"
                                        actionVisible={(actionName, row) => {
                                            if (actionName === 'edit' || actionName === 'delete') {
                                                return Boolean(row && row.id !== undefined && row.id !== null);
                                            }
                                            return true;
                                        }}
                                        striped
                                        hover
                                        responsive
                                        emptyMessage="No hay permisos registrados en el sistema"
                                    />
                                )}

                                {tableStyle === 'bootstrap' && (
                                    <GenericTableBootstrap
                                        data={permissions as any}
                                        columns={["id", "url", "method", "entity"]}
                                        actions={[
                                            { name: "view", label: "Ver", variant: "outline-primary", icon: 'view' },
                                            { name: "edit", label: "Editar", variant: "outline-warning", icon: 'edit' },
                                            { name: "delete", label: "Eliminar", variant: "outline-danger", icon: 'delete' },
                                        ]}
                                        onAction={handleAction}
                                        striped
                                        hover
                                        responsive
                                        emptyMessage="No hay permisos registrados en el sistema"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para ver detalles del permiso (Tailwind) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
                    <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-xl mx-4">
                        <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-stroke">
                                <h3 className="text-lg font-semibold">Detalle del Permiso</h3>
                                <button onClick={handleCloseModal} className="text-body text-sm px-2 py-1">Cerrar</button>
                            </div>
                            <div className="p-4">
                                {selectedPermission ? (
                                    <div className="space-y-2 text-sm">
                                        <div><strong>ID:</strong> {selectedPermission.id}</div>
                                        <div><strong>URL:</strong> {selectedPermission.url}</div>
                                        <div><strong>Método:</strong> {selectedPermission.method}</div>
                                        <div><strong>Entidad:</strong> {selectedPermission.entity}</div>
                                        <div><strong>Creado:</strong> {selectedPermission.created_at ? new Date(selectedPermission.created_at).toLocaleString() : '-'}</div>
                                        <div><strong>Última actualización:</strong> {selectedPermission.updated_at ? new Date(selectedPermission.updated_at).toLocaleString() : '-'}</div>
                                    </div>
                                ) : (
                                    <p className="text-muted">Sin datos</p>
                                )}
                            </div>
                            <div className="p-4 border-t border-stroke flex justify-end">
                                <button className="px-4 py-2 rounded-md border text-sm" onClick={handleCloseModal}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListPermissions;
