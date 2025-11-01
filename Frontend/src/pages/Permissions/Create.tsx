import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';
import { permissionService } from '../../services/permissionService';
import { Permission } from '../../models/Permission';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GenericEntityForm, { FieldDef } from '../../components/formValidators/GenericEntityForm';

const CreatePermission: React.FC = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(true); // abrir modal al cargar la página
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    useEffect(() => {
        // abrir modal al montarse
        setShowModal(true);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        // volver a la lista
        navigate('/permissions/list');
    };

    // fields will adapt when in editMode (id read-only, only url & method editable)
    const baseFields: FieldDef[] = [
        { name: 'url', label: 'URL', type: 'text', required: true, placeholder: '/api/users' },
        { name: 'method', label: 'Método', type: 'select', required: true, options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' },
        ]},
    ];

    const fields = editMode ? [
        { name: 'id', label: 'ID', type: 'text', readOnly: true },
        ...baseFields
    ] : baseFields;

    const deriveEntityFromUrl = (url?: string) => {
        if (!url) return '';
        try {
            const clean = String(url).split('?')[0].split('#')[0];
            const parts = clean.split('/').filter(Boolean);
            // prefer the first segment after possible api/version prefixes
            // if route starts with 'api' or 'v1' choose the next segment
            if (parts.length === 0) return '';
            if (parts[0].toLowerCase() === 'api' && parts.length > 1) return parts[1];
            if (/^v\d+/i.test(parts[0]) && parts.length > 1) return parts[1];
            // normalize entity names to match backend conventions
            const seg = parts[0];
            const lower = seg.toLowerCase();
            // special-case: 'roles' should map to singular 'Role'
            if (lower === 'roles') return 'Role';
            // default: capitalize first letter (e.g. users -> Users)
            return seg.charAt(0).toUpperCase() + seg.slice(1);
        } catch (e) {
            return '';
        }
    };

    const handleCreate = async (values: any) => {
        setError(null);
        try {
            const derivedEntity = deriveEntityFromUrl(values.url);
            const payload: Omit<Permission, 'id' | 'created_at' | 'updated_at'> = {
                url: values.url?.trim(),
                method: values.method?.trim(),
                // always prefer derived entity from URL; fall back to any provided value
                entity: derivedEntity || (values.entity && values.entity.trim()) || ''
            };

            const created = await permissionService.createPermission(payload as any);
            if (created) {
                // close modal first to avoid focus/aria-hidden conflicts
                setShowModal(false);
                Swal.fire({ title: '¡Completado!', text: 'El permiso se ha creado correctamente.', icon: 'success', timer: 1400, showConfirmButton: false });
                setTimeout(() => navigate('/permissions/list'), 700);
                return created;
            } else {
                setError('No se pudo crear el permiso. Verifica los datos.');
                Swal.fire('Error', 'No se pudo crear el permiso', 'error');
                return null;
            }
        } catch (err: any) {
            console.error('Error creating permission:', err);
            // if server returned a message, show it
            const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
            setError(typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor.');
            Swal.fire('Error', typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor', 'error');
            return null;
        }
    };

    // fetch edit param and load permission if present
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId) {
            (async () => {
                setLoadingEdit(true);
                setEditMode(true);
                try {
                    const perm = await permissionService.getPermissionById(Number(editId));
                    if (perm) {
                        setEditingPermission(perm);
                        // ensure modal open
                        setShowModal(true);
                    } else {
                        setError('Permiso a editar no encontrado');
                    }
                } catch (err: any) {
                    console.error('Error fetching permission for edit:', err);
                    setError('Error al cargar permiso para editar');
                } finally {
                    setLoadingEdit(false);
                }
            })();
        }
    }, [searchParams]);

    const handleUpdate = async (values: any) => {
        setError(null);
        try {
            const id = editingPermission?.id;
            if (!id) {
                setError('ID de permiso no disponible para actualizar');
                return null;
            }
            const derivedEntity = deriveEntityFromUrl(values.url);
            const payload: Partial<Permission> = {
                url: values.url?.trim(),
                method: values.method?.trim(),
                // always prefer derived entity from URL when updating
                entity: derivedEntity || (values.entity && values.entity.trim()) || ''
            };

            const updated = await permissionService.updatePermission(Number(id), payload);
            if (updated) {
                setShowModal(false);
                Swal.fire({ title: '¡Actualizado!', text: 'El permiso se ha actualizado correctamente.', icon: 'success', timer: 1400, showConfirmButton: false });
                setTimeout(() => navigate('/permissions/list'), 700);
                return updated;
            } else {
                setError('No se pudo actualizar el permiso');
                Swal.fire('Error', 'No se pudo actualizar el permiso', 'error');
                return null;
            }
        } catch (err: any) {
            console.error('Error updating permission:', err);
            const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
            setError(typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor.');
            Swal.fire('Error', typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor', 'error');
            return null;
        }
    };

    return (
        <div className="py-4 px-4">
            <div className="mb-4">
                <Breadcrumb pageName="Crear Permiso" />
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => navigate('/permissions/list')}
                        className="inline-flex items-center gap-2 px-2 py-1 border rounded text-sm text-body bg-white"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                    <div>
                        <h2 className="text-title-sm font-bold mb-1" style={{ color: '#10b981' }}>
                            Crear Nuevo Permiso
                        </h2>
                        <p className="text-muted mb-0">Complete los campos para crear un permiso</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4">
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 shadow-sm">
                        {error}
                        <button onClick={() => setError(null)} className="ml-3 text-red-600 underline text-xs">Cerrar</button>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="max-w-xl">
                    <div className="shadow-card rounded-lg bg-white dark:bg-boxdark">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="mb-0">Formulario rápido</h5>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="inline-flex items-center gap-2 bg-meta-3 text-white px-3 py-1 rounded text-sm"
                                >
                                    <Plus size={14} /> Abrir formulario
                                </button>
                            </div>
                            <p className="text-sm text-body text-muted">Al guardar, el permiso será enviado al backend.</p>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
                    <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-2xl mx-4">
                        <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-stroke">
                                <h3 className="text-lg font-semibold">Nuevo Permiso</h3>
                                <button onClick={handleClose} className="text-body text-sm px-2 py-1">Cancelar</button>
                            </div>
                            <div className="p-4">
                                {loadingEdit ? (
                                    <div className="flex justify-center py-6">
                                        <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                    </div>
                                ) : (
                                    <GenericEntityForm
                                        key={editMode ? `edit-${editingPermission?.id}` : 'create'}
                                        mode={(editMode ? 2 : 1) as 1 | 2}
                                        fields={fields}
                                        initialValues={editMode && editingPermission ? {
                                            id: String(editingPermission.id),
                                            url: editingPermission.url || '',
                                            method: editingPermission.method || '',
                                            entity: editingPermission.entity || ''
                                        } : undefined}
                                        onCreate={handleCreate}
                                        onUpdate={handleUpdate}
                                    />
                                )}
                            </div>
                            <div className="p-4 border-t border-stroke flex justify-end">
                                <button className="px-4 py-2 rounded-md border text-sm" onClick={handleClose}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePermission;


