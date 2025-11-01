/**
 * UsersListReusable - Usando GenericCRUDView
 * Versión súper simple con CRUD completo en solo 24 líneas
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const UsersListReusable: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="usuarios"
      entityNameSingular="usuario"
      emoji="👥"
      endpoint="users"
      columns={["id", "name", "email"]}
      columnLabels={{
        id: "ID",
        name: "Nombre",
        email: "Correo Electrónico"
      }}
      formFields={[
        { 
          name: "name", 
          label: "Nombre Completo", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Ej: Juan Pérez"
        },
        { 
          name: "email", 
          label: "Correo Electrónico", 
          type: "email", 
          required: true, 
          cols: 12,
          placeholder: "juan@ejemplo.com",
          helpText: "El email debe ser único en el sistema"
        }
      ]}
      emptyMessage="📭 No hay usuarios registrados en el sistema"
    />
  );
};

export default UsersListReusable;
