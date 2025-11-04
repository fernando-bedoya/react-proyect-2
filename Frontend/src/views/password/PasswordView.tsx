/**
 * PasswordView - CRUD completo usando GenericCRUDView
 * Reducido de 700+ líneas a solo ~50 líneas
 * 
 * Características:
 * - Listar todas las contraseñas históricas
 * - Crear nueva contraseña para un usuario
 * - Editar contraseña existente
 * - Eliminar contraseña
 * - Sincronización automática con Firebase Auth
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import Swal from 'sweetalert2';

const formatDateToBackend = (datetimeLocal: string) => {
  if (!datetimeLocal) return '';
  const d = new Date(datetimeLocal);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

const PasswordView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="contraseñas"
      entityNameSingular="contraseña"
      emoji="🔐"
      endpoint="passwords"
      columns={["id", "user_email", "startAt", "endAt", "created_at"]}
      columnLabels={{
        id: "ID",
        user_email: "Usuario",
        startAt: "Fecha Inicio",
        endAt: "Fecha Fin",
        created_at: "Fecha Creación"
      }}
      formFields={[
        { 
          name: "user_id", 
          label: "Usuario", 
          type: "select", 
          required: true, 
          cols: 12,
          helpText: "Seleccione el usuario para el cual crear la contraseña",
          relatedDataKey: "users",
          relatedValueField: "id",
          relatedLabelField: "email"
        },
        { 
          name: "content", 
          label: "Contraseña", 
          type: "password", 
          required: true, 
          cols: 12,
          helpText: "La contraseña será encriptada automáticamente",
          placeholder: "Ingrese una contraseña segura"
        },
        { 
          name: "startAt", 
          label: "Fecha de Inicio", 
          type: "datetime-local", 
          required: true, 
          cols: 6,
          helpText: "Fecha desde la cual esta contraseña será válida"
        },
        { 
          name: "endAt", 
          label: "Fecha de Fin", 
          type: "datetime-local", 
          required: true, 
          cols: 6,
          helpText: "Fecha hasta la cual esta contraseña será válida"
        }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "email" }
      ]}
      dataTransformer={(passwords, relatedData) => {
        return passwords.map((pwd: any) => {
          const user = relatedData?.users?.find((u: any) => u.id === pwd.user_id);
          return {
            ...pwd,
            user_email: user?.email || `Usuario ${pwd.user_id}`,
            startAt: pwd.startAt ? new Date(pwd.startAt).toLocaleString() : '-',
            endAt: pwd.endAt ? new Date(pwd.endAt).toLocaleString() : '-',
            created_at: pwd.created_at ? new Date(pwd.created_at).toLocaleString() : '-'
          };
        });
      }}
      onBeforeCreate={(data) => {
        // Validar fechas
        const start = new Date(data.startAt);
        const end = new Date(data.endAt);
        if (end <= start) {
          Swal.fire({
            title: 'Error de validación',
            text: 'La fecha de fin debe ser posterior a la fecha de inicio',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
          throw new Error('Fechas inválidas');
        }

        // Convertir fechas al formato del backend
        return {
          content: data.content,
          startAt: formatDateToBackend(data.startAt),
          endAt: formatDateToBackend(data.endAt)
        };
      }}
      onAfterCreate={async (data) => {
        // Intentar actualizar contraseña en Firebase si el usuario está autenticado
        const currentUser = auth.currentUser;
        if (currentUser && data.content) {
          try {
            await firebaseUpdatePassword(currentUser, data.content);
            console.log('✅ Contraseña sincronizada con Firebase');
          } catch (error) {
            console.warn('⚠️ No se pudo sincronizar con Firebase (requiere reautenticación reciente)');
          }
        }
      }}
      onBeforeUpdate={(_id, data) => {
        // Solo enviar campos que fueron modificados
        const payload: any = {};
        if (data.content) payload.content = data.content;
        if (data.startAt) payload.startAt = formatDateToBackend(data.startAt);
        if (data.endAt) payload.endAt = formatDateToBackend(data.endAt);
        
        // Validar fechas si ambas están presentes
        if (payload.startAt && payload.endAt) {
          const start = new Date(data.startAt);
          const end = new Date(data.endAt);
          if (end <= start) {
            Swal.fire({
              title: 'Error de validación',
              text: 'La fecha de fin debe ser posterior a la fecha de inicio',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
            throw new Error('Fechas inválidas');
          }
        }
        
        return payload;
      }}
      emptyMessage="📭 No hay contraseñas registradas en el historial"
    />
  );
};

export default PasswordView;
