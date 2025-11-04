/**
 * RoleView - CRUD completo usando GenericCRUDView
 * Reducido de 500+ líneas a solo ~40 líneas
 * 
 * Características:
 * - Listar todos los roles
 * - Crear nuevo rol
 * - Editar rol existente
 * - Eliminar rol
 * - Acción personalizada: Asignar permisos
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericCRUDView from '../../components/GenericCRUDView';

const RoleView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GenericCRUDView
      entityName="roles"
      entityNameSingular="rol"
      emoji="🛡️"
      endpoint="roles"
      columns={["id", "name", "description"]}
      columnLabels={{
        id: "ID",
        name: "Nombre del Rol",
        description: "Descripción"
      }}
      formFields={[
        { 
          name: "name", 
          label: "Nombre del Rol", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Ej: Administrador, Usuario, Moderador",
          helpText: "Nombre único que identifica el rol en el sistema"
        },
        { 
          name: "description", 
          label: "Descripción", 
          type: "textarea", 
          required: false, 
          cols: 12,
          placeholder: "Describa las responsabilidades y permisos de este rol",
          helpText: "Información adicional sobre el propósito del rol (opcional)"
        }
      ]}
      customActions={[
        {
          name: "assignPermissions",
          label: "Asignar Permisos",
          icon: "shield",
          variant: "outline-info",
          handler: (role) => {
            // Navegar a la página de permisos filtrada por este rol
            navigate(`/permissions/list/${role.id}`);
          }
        }
      ]}
      onBeforeCreate={(data) => {
        // Limpiar espacios en blanco del nombre
        return {
          name: (data.name || '').trim(),
          description: data.description || ''
        };
      }}
      emptyMessage="📭 No hay roles registrados en el sistema"
    />
  );
};

export default RoleView;
