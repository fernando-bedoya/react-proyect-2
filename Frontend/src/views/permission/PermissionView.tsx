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
      columns={["id", "entity", "method", "url", "created_at"]}
      columnLabels={{
        id: "ID",
        entity: "Entidad",
        method: "Método",
        url: "URL",
        created_at: "Fecha Creación"
      }}
      formFields={[
        {
          name: "entity",
          label: "Entidad",
          type: "text",
          required: true,
          cols: 6,
          placeholder: "Ej: Users, Role",
          helpText: "Nombre de la entidad a la que aplica el permiso"
        },
        {
          name: "method",
          label: "Método HTTP",
          type: "text",
          required: true,
          cols: 3,
          placeholder: "GET, POST, PUT, PATCH, DELETE",
          helpText: "Método HTTP asociado al permiso"
        },
        {
          name: "url",
          label: "URL",
          type: "text",
          required: true,
          cols: 3,
          placeholder: "/users/, /roles",
          helpText: "Ruta a la que aplica el permiso"
        }
      ]}
      dataTransformer={(permissions) => {
        return permissions.map((perm: any) => ({
          ...perm,
          // Map backend fields to table fields; fallback to '-' when missing
          entity: perm.entity || perm.name || '-',
          method: perm.method || '-',
          url: perm.url || '-',
          created_at: perm.created_at ? new Date(perm.created_at).toLocaleString() : '-'
        }));
      }}
      onBeforeCreate={(data) => {
        // Backend expects { entity, method, url }
        return {
          entity: (data.entity || '').trim(),
          method: (data.method || '').trim().toUpperCase(),
          url: (data.url || '').trim()
        };
      }}
      emptyMessage="📭 No hay permisos registrados en el sistema"
    />
  );
};

export default PermissionView;
