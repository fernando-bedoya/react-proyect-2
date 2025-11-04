import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import GenericTable from "../../components/GenericTable";
import ThemeSelector from "../../components/ThemeSelector";
import { useTheme } from "../../context/ThemeContext";
import sessionService from "../../services/sessionService";
import { Session } from "../../models/Session";

const SessionsList: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // 🎨 Hook para obtener el tema actual desde el contexto global
    const { designLibrary } = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await sessionService.getSessions();
            setSessions(data);
            console.log("Sessions fetched:", data);
        } catch (err) {
            console.error("Error fetching sessions:", err);
            setError("Error al cargar las sesiones. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, item: Session) => {
        if (action === "view") {
            Swal.fire({
                title: "Detalle de Sesión",
                html: `
                    <div class="text-left">
                        <p><strong>ID:</strong> ${item.id || 'N/A'}</p>
                        <p><strong>User ID:</strong> ${item.user_id || 'N/A'}</p>
                        <p><strong>Token:</strong> ${item.token || 'N/A'}</p>
                        <p><strong>Expiración:</strong> ${item.expiration ? new Date(item.expiration).toLocaleString() : 'N/A'}</p>
                        <p><strong>FACode:</strong> ${item.FACode || 'N/A'}</p>
                        <p><strong>Estado:</strong> ${item.state || 'N/A'}</p>
                        <p><strong>Creado:</strong> ${item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</p>
                        <p><strong>Actualizado:</strong> ${item.updated_at ? new Date(item.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                `,
                icon: "info",
                confirmButtonColor: "#10b981",
                confirmButtonText: "Cerrar"
            });
        } else if (action === "edit") {
            navigate(`/sessions/create?edit=${item.id}`);
        } else if (action === "delete") {
            Swal.fire({
                title: "Eliminación",
                text: "¿Está seguro de querer eliminar esta sesión?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#10b981",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const success = await sessionService.deleteSession(item.id as string);
                    if (success) {
                        setSuccessMessage("La sesión se ha eliminado correctamente");
                        setTimeout(() => setSuccessMessage(null), 3000);
                        Swal.fire({
                            title: "Eliminado",
                            text: "La sesión se ha eliminado",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });
                        fetchData();
                    }
                }
            });
        }
    };

    const handleCreateNew = () => {
        navigate('/sessions/create');
    };

    const handleRefresh = () => {
        setSuccessMessage(null);
        setError(null);
        fetchData();
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-meta-3">
                            Gestión de Sesiones
                        </h2>
                        <p className="text-muted mb-0">
                            Administre las sesiones activas del sistema
                            <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-800">
                                {sessions.length} sesiones
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {/* 🎨 Selector de tema unificado - reemplaza botones customizados */}
                        <ThemeSelector />
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
                            Nueva Sesión
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

            {/* Table */}
            <div className="bg-white dark:bg-boxdark rounded shadow-sm border-0">
                <div className="p-0">
                    {loading ? (
                        <div className="text-center py-8">
                            <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="mt-3 text-muted">Cargando sesiones...</p>
                        </div>
                    ) : (
                        <>
                            {/* 📊 Tabla genérica unificada - se adapta automáticamente al tema seleccionado */}
                            <GenericTable
                                data={sessions.map(s => ({
                                    ...s,
                                    token: s.token ? `${s.token.substring(0, 20)}...` : '-',
                                    expiration: s.expiration ? new Date(s.expiration).toLocaleString() : '-'
                                })) as any}
                                columns={["id", "user_id", "token", "expiration", "state"]}
                                actions={[
                                    { name: "view", label: "Ver", variant: "outline-primary", icon: 'view' },
                                    { name: "edit", label: "Editar", variant: "warning", icon: 'edit' },
                                    { name: "delete", label: "Eliminar", variant: "outline-danger", icon: 'delete' },
                                ]}
                                onAction={handleAction}
                                striped
                                hover
                                responsive
                                emptyMessage="No hay sesiones registradas en el sistema"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionsList;
