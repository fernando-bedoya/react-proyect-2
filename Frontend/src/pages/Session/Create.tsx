import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";
import ThemeSelector from "../../components/ThemeSelector";
import sessionService from "../../services/sessionService";
import SessionFormValidator from "../../components/formValidators/SessionFormValidator";
import { Session } from "../../models/Session";

const SessionCreate: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditMode = Boolean(editId);

    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<Partial<Session> | null>(null);

    useEffect(() => {
        if (isEditMode && editId) {
            fetchSessionData(editId);
        }
    }, [editId, isEditMode]);

    const fetchSessionData = async (sessionId: string) => {
        try {
            setLoading(true);
            const data = await sessionService.getSessionById(sessionId);
            
            // Format expiration for datetime-local input
            let formattedExpiration = "";
            if (data.expiration) {
                const date = new Date(data.expiration);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                formattedExpiration = `${year}-${month}-${day}T${hours}:${minutes}`;
            }

            setInitialValues({
                user_id: data.user_id,
                token: data.token || "",
                expiration: formattedExpiration,
                FACode: data.FACode || "",
                state: data.state || "active",
            });
        } catch (error) {
            console.error("Error fetching session:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo cargar la sesión",
                icon: "error",
                confirmButtonColor: "#10b981",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        // Convert datetime-local to backend format "YYYY-MM-DD HH:MM:SS"
        const formatDateForBackend = (dateTimeLocal: string): string => {
            const date = new Date(dateTimeLocal);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const payload: any = {
            token: values.token || undefined,
            expiration: formatDateForBackend(values.expiration),
            FACode: values.FACode || undefined,
            state: values.state,
        };

        await sessionService.createSession(values.user_id, payload);

        Swal.fire({
            title: "Éxito",
            text: "La sesión se ha creado correctamente",
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 2000,
            showConfirmButton: false,
        });

        setTimeout(() => {
            navigate("/sessions/list");
        }, 2000);
    };

    const handleUpdate = async (values: any) => {
        if (!editId) return;

        // Convert datetime-local to backend format "YYYY-MM-DD HH:MM:SS"
        const formatDateForBackend = (dateTimeLocal: string): string => {
            const date = new Date(dateTimeLocal);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const payload: any = {
            token: values.token || undefined,
            expiration: formatDateForBackend(values.expiration),
            FACode: values.FACode || undefined,
            state: values.state,
        };

        await sessionService.updateSession(editId, payload);

        Swal.fire({
            title: "Éxito",
            text: "La sesión se ha actualizado correctamente",
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 2000,
            showConfirmButton: false,
        });

        setTimeout(() => {
            navigate("/sessions/list");
        }, 2000);
    };

    const handleCancel = () => {
        navigate("/sessions/list");
    };

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted">Cargando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
                        >
                            <ArrowLeft size={20} />
                            Volver a la lista
                        </button>
                        <h2 className="text-2xl font-bold text-meta-3">
                            {isEditMode ? "Editar Sesión" : "Nueva Sesión"}
                        </h2>
                        <p className="text-muted mt-1">
                            {isEditMode 
                                ? "Modifique los datos de la sesión existente"
                                : "Complete el formulario para crear una nueva sesión"}
                        </p>
                    </div>
                    <ThemeSelector />
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-boxdark rounded shadow-sm border p-6">
                <SessionFormValidator
                    mode={isEditMode ? 2 : 1}
                    initialValues={initialValues}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                    submitLabel={isEditMode ? "Actualizar Sesión" : "Crear Sesión"}
                />
                
                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionCreate;
