/**
 * UserViewGeneric - CRUD completo usando GenericCRUDView
 * Reducido de 600+ líneas a solo ~70 líneas
 * 
 * Características:
 * - Listar todos los usuarios
 * - Crear nuevo usuario
 * - Editar usuario existente
 * - Eliminar usuario
 * - Acciones personalizadas: Ver perfil, Direcciones, Dispositivos, Sesiones, Contraseñas
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import GenericCRUDView from '../../components/GenericCRUDView';

const UserViewGeneric: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GenericCRUDView
      entityName="usuarios"
      entityNameSingular="usuario"
      emoji="👥"
      endpoint="users"
      columns={["id", "name", "email"]}
      columnLabels={{
        id: "ID",
        name: "Nombre Completo",
        email: "Correo Electrónico"
      }}
      formFields={[
        { 
          name: "name", 
          label: "Nombre Completo", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Ej: Juan Pérez García",
          helpText: "Nombre completo del usuario"
        },
        { 
          name: "email", 
          label: "Correo Electrónico", 
          type: "email", 
          required: true, 
          cols: 12,
          placeholder: "usuario@ejemplo.com",
          helpText: "Dirección de correo electrónico válida"
        }
      ]}
      customActions={[
        {
          name: "profile",
          label: "Perfil",
          icon: "user",
          variant: "outline-info",
          handler: (user) => navigate(`/profile/${user.id}`)
        },
        {
          name: "addresses",
          label: "Direcciones",
          icon: "map",
          variant: "outline-secondary",
          handler: (user) => navigate(`/addresses?userId=${user.id}`)
        },
        {
          name: "devices",
          label: "Dispositivos",
          icon: "smartphone",
          variant: "outline-primary",
          handler: (user) => navigate(`/devices?userId=${user.id}`)
        },
        {
          name: "sessions",
          label: "Sesiones",
          icon: "clock",
          variant: "outline-warning",
          handler: (user) => navigate(`/sessions/list?userId=${user.id}`)
        },
        {
          name: "passwords",
          label: "Contraseñas",
          icon: "key",
          variant: "outline-danger",
          handler: (user) => navigate(`/passwords/list?userId=${user.id}`)
        },
        {
          name: "roles",
          label: "Roles",
          icon: "shield",
          variant: "outline-success",
          handler: (user) => navigate(`/user-roles?userId=${user.id}`)
        }
      ]}
      onBeforeCreate={(data) => {
        // Validar y limpiar datos antes de crear
        return {
          name: (data.name || '').trim(),
          email: (data.email || '').trim().toLowerCase()
        };
      }}
      emptyMessage="📭 No hay usuarios registrados en el sistema"
    />
  );
};

export default UserViewGeneric;
