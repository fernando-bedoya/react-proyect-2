/**
 * PermissionView - CRUD completo usando GenericCRUDView
 * Reducido de 300+ líneas a solo ~50 líneas
 * 
 * Características:
 * - Listar todos los permisos
 * - Crear nuevo permiso
 * - Editar permiso existente
 * - Eliminar permiso
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const PermissionView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="permisos"
      entityNameSingular="permiso"
      emoji="🔑"
      endpoint="permissions"
      columns={["id", "name", "description", "created_at"]}
      columnLabels={{
        id: "ID",
        name: "Nombre del Permiso",
        description: "Descripción",
        created_at: "Fecha Creación"
      }}
      formFields={[
        { 
          name: "name", 
          label: "Nombre del Permiso", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Ej: users.create, roles.delete, reports.view",
          helpText: "Nombre único que identifica el permiso (formato: entidad.accion)"
        },
        { 
          name: "description", 
          label: "Descripción", 
          type: "textarea", 
          required: false, 
          cols: 12,
          placeholder: "Describa qué permite hacer este permiso",
          helpText: "Información adicional sobre el propósito del permiso (opcional)"
        }
      ]}
      dataTransformer={(permissions) => {
        return permissions.map((perm: any) => ({
          ...perm,
          created_at: perm.created_at ? new Date(perm.created_at).toLocaleString() : '-'
        }));
      }}
      onBeforeCreate={(data) => {
        // Limpiar espacios en blanco y convertir a minúsculas
        return {
          name: (data.name || '').trim().toLowerCase(),
          description: data.description || ''
        };
      }}
      emptyMessage="📭 No hay permisos registrados en el sistema"
    />
  );
};

export default PermissionView;
