/**
 * GenericCRUDView - Componente SÚPER REUTILIZABLE para cualquier CRUD
 * 
 * Uso:
 * <GenericCRUDView
 *   entityName="usuarios"
 *   entityNameSingular="usuario"
 *   emoji="👥"
 *   endpoint="users"
 *   columns={["id", "name", "email"]}
 *   formFields={[
 *     { name: "name", label: "Nombre", type: "text", required: true },
 *     { name: "email", label: "Email", type: "email", required: true }
 *   ]}
 * />
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Plus, RefreshCw } from 'lucide-react';
import GenericTable from './GenericTable';
import GenericForm, { FieldConfig } from './GenericForm';
import GenericModal from './GenericModal';
import ThemeSelector from './ThemeSelector';
import { getAll, create, update, remove } from '../services/baseService';
import Swal from 'sweetalert2';

export interface CRUDField {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  // Para select dinámicos que se llenan con datos relacionados
  relatedDataKey?: string; // Ej: "users" para poblar desde relatedData.users
  relatedValueField?: string; // Campo a usar como value (default: "id")
  relatedLabelField?: string; // Campo a usar como label (default: "name")
  helpText?: string;
  cols?: number;
  validation?: any;
}

export interface GenericCRUDViewProps {
  // Básicos
  entityName: string; // "usuarios", "dispositivos", etc.
  entityNameSingular: string; // "usuario", "dispositivo", etc.
  emoji: string; // "👥", "📱", etc.
  endpoint: string; // "users", "devices", etc.
  
  // Configuración de tabla
  columns: string[];
  columnLabels?: Record<string, string>; // { id: "ID", name: "Nombre" }
  
  // Configuración de formulario
  formFields: CRUDField[];
  
  // Opcionales
  relatedEndpoints?: { name: string; endpoint: string; labelField?: string }[]; // Para cargar datos relacionados
  emptyMessage?: string;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  customActions?: Array<{
    name: string;
    label: string;
    icon: string;
    variant: string;
    handler: (item: any) => void;
  }>;
  
  // Transformación de datos
  dataTransformer?: (data: any[], relatedData?: Record<string, any[]>) => any[];
  
  // Callbacks
  onBeforeCreate?: (data: any) => any;
  onAfterCreate?: (data: any) => void;
  onBeforeUpdate?: (id: any, data: any) => any;
  onAfterUpdate?: (id: any, data: any) => void;
  onBeforeDelete?: (id: any) => boolean | Promise<boolean>;
  onAfterDelete?: (id: any) => void;
}

const GenericCRUDView: React.FC<GenericCRUDViewProps> = ({
  entityName,
  entityNameSingular,
  emoji,
  endpoint,
  columns,
  columnLabels = {},
  formFields,
  relatedEndpoints = [],
  emptyMessage,
  showCreate = true,
  showEdit = true,
  showDelete = true,
  customActions = [],
  dataTransformer,
  onBeforeCreate,
  onAfterCreate,
  onBeforeUpdate,
  onAfterUpdate,
  onBeforeDelete,
  onAfterDelete
}) => {
  const [data, setData] = useState<any[]>([]);
  const [relatedData, setRelatedData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Cargar datos principales y relacionados en paralelo
      const promises: Promise<any>[] = [getAll(endpoint)];
      
      relatedEndpoints.forEach(rel => {
        promises.push(getAll(rel.endpoint));
      });

      const results = await Promise.all(promises);
      
      const mainData = Array.isArray(results[0]) ? results[0] : [];
      setData(mainData);

      // Guardar datos relacionados
      const related: Record<string, any[]> = {};
      relatedEndpoints.forEach((rel, index) => {
        related[rel.name] = Array.isArray(results[index + 1]) ? results[index + 1] : [];
      });
      setRelatedData(related);

    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    // Callback antes de eliminar
    if (onBeforeDelete) {
      const shouldContinue = await onBeforeDelete(item.id);
      if (!shouldContinue) return;
    }

    const result = await Swal.fire({
      title: `¿Eliminar ${entityNameSingular}?`,
      text: `Esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await remove(endpoint, item.id);
        await Swal.fire({
          title: '¡Eliminado!',
          text: `${entityNameSingular.charAt(0).toUpperCase() + entityNameSingular.slice(1)} eliminado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        loadData();
        
        // Callback después de eliminar
        if (onAfterDelete) {
          onAfterDelete(item.id);
        }
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || err.message,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (modalMode === 'create') {
        // Callback antes de crear
        const dataToSend = onBeforeCreate ? onBeforeCreate(formData) : formData;
        
        await create(endpoint, dataToSend);
        await Swal.fire({
          title: '¡Creado!',
          text: `${entityNameSingular.charAt(0).toUpperCase() + entityNameSingular.slice(1)} creado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        
        // Callback después de crear
        if (onAfterCreate) {
          onAfterCreate(dataToSend);
        }
      } else {
        // Callback antes de actualizar
        const dataToSend = onBeforeUpdate ? onBeforeUpdate(selectedItem.id, formData) : formData;
        
        await update(endpoint, selectedItem.id, dataToSend);
        await Swal.fire({
          title: '¡Actualizado!',
          text: `${entityNameSingular.charAt(0).toUpperCase() + entityNameSingular.slice(1)} actualizado exitosamente`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        
        // Callback después de actualizar
        if (onAfterUpdate) {
          onAfterUpdate(selectedItem.id, dataToSend);
        }
      }
      
      setShowModal(false);
      loadData();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || err.message,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleAction = (actionName: string, item: any) => {
    if (actionName === 'edit') {
      handleEdit(item);
    } else if (actionName === 'delete') {
      handleDelete(item);
    } else {
      // Acciones personalizadas
      const customAction = customActions.find(a => a.name === actionName);
      if (customAction) {
        customAction.handler(item);
      }
    }
  };

  // Enriquecer formFields con datos relacionados para selects dinámicos
  const enrichedFormFields: FieldConfig[] = formFields.map(field => {
    if (field.type === 'select' && field.relatedDataKey && !field.options) {
      const relatedItems = relatedData[field.relatedDataKey] || [];
      const valueField = field.relatedValueField || 'id';
      const labelField = field.relatedLabelField || 'name';
      
      return {
        name: field.name,
        label: field.label || field.name,
        type: 'select' as const,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        cols: field.cols,
        options: relatedItems.map((item: any) => ({
          value: item[valueField],
          label: item[labelField] || item[valueField]
        }))
      };
    }
    return { 
      name: field.name,
      label: field.label || field.name,
      type: field.type || 'text',
      required: field.required,
      placeholder: field.placeholder,
      helpText: field.helpText,
      cols: field.cols,
      options: field.options
    };
  });

  // Transformar datos si se proporciona transformador
  const tableData = dataTransformer ? dataTransformer(data, relatedData) : data;

  // Construir acciones
  const actions: any[] = [];
  if (showEdit) {
    actions.push({ name: "edit", label: "Editar", icon: "edit", variant: "outline-primary" });
  }
  if (showDelete) {
    actions.push({ name: "delete", label: "Eliminar", icon: "delete", variant: "outline-danger" });
  }
  actions.push(...customActions);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h2 fw-bold mb-2" style={{ 
                color: '#065f46',
                fontFamily: '"Segoe UI", sans-serif',
                letterSpacing: '-0.5px'
              }}>
                {emoji} {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
              </h2>
              <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
                Gestión de {entityName}
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
                  {data.length} {data.length === 1 ? entityNameSingular : entityName}
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
              {showCreate && (
                <Button 
                  variant="success"
                  onClick={handleCreate}
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
                  Nuevo {entityNameSingular.charAt(0).toUpperCase() + entityNameSingular.slice(1)}
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
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

      {/* Table */}
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
                ⏳ Cargando {entityName}...
              </p>
            </div>
          ) : (
            <GenericTable
              data={tableData}
              columns={columns}
              columnLabels={columnLabels}
              actions={actions}
              onAction={handleAction}
              striped
              hover
              responsive
              emptyMessage={emptyMessage || `📭 No hay ${entityName} registrados`}
            />
          )}
        </Col>
      </Row>

      {/* Modal para Crear/Editar */}
      <GenericModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalMode === 'create' ? `Nuevo ${entityNameSingular}` : `Editar ${entityNameSingular}`}
        size="lg"
      >
        <GenericForm
          fields={enrichedFormFields}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitLabel={modalMode === 'create' ? 'Crear' : 'Actualizar'}
          cancelLabel="Cancelar"
          initialData={modalMode === 'edit' ? selectedItem : undefined}
        />
      </GenericModal>
    </Container>
  );
};

export default GenericCRUDView;
