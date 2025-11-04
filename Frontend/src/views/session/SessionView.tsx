/**
 * SessionView - CRUD completo usando GenericCRUDView
 * Reducido de 200+ líneas a solo ~60 líneas
 * 
 * Características:
 * - Listar todas las sesiones
 * - Crear nueva sesión
 * - Ver detalles de sesión (modal)
 * - Eliminar sesión
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';
import Swal from 'sweetalert2';

const SessionView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="sesiones"
      entityNameSingular="sesión"
      emoji="🔐"
      endpoint="sessions"
      columns={["id", "user_email", "expiration", "state", "created_at"]}
      columnLabels={{
        id: "ID",
        user_email: "Usuario",
        expiration: "Expiración",
        state: "Estado",
        created_at: "Fecha Creación"
      }}
      formFields={[
        { 
          name: "user_id", 
          label: "Usuario", 
          type: "select", 
          required: true, 
          cols: 12,
          helpText: "Seleccione el usuario para crear la sesión",
          relatedDataKey: "users",
          relatedValueField: "id",
          relatedLabelField: "email"
        },
        { 
          name: "token", 
          label: "Token de Sesión", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Generado automáticamente o ingrese uno personalizado",
          helpText: "Token único para identificar la sesión"
        },
        { 
          name: "expiration", 
          label: "Fecha de Expiración", 
          type: "datetime-local", 
          required: true, 
          cols: 6,
          helpText: "Fecha y hora cuando expirará la sesión"
        },
        { 
          name: "FACode", 
          label: "Código 2FA", 
          type: "text", 
          required: false, 
          cols: 6,
          placeholder: "Código de autenticación de dos factores (opcional)",
          helpText: "Código opcional para autenticación de dos factores"
        },
        { 
          name: "state", 
          label: "Estado", 
          type: "select", 
          required: true, 
          cols: 12,
          options: [
            { value: "active", label: "Activa" },
            { value: "expired", label: "Expirada" },
            { value: "revoked", label: "Revocada" }
          ],
          helpText: "Estado actual de la sesión"
        }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "email" }
      ]}
      dataTransformer={(sessions, relatedData) => {
        return sessions.map((session: any) => {
          const user = relatedData?.users?.find((u: any) => u.id === session.user_id);
          return {
            ...session,
            user_email: user?.email || `Usuario ${session.user_id}`,
            expiration: session.expiration ? new Date(session.expiration).toLocaleString() : '-',
            created_at: session.created_at ? new Date(session.created_at).toLocaleString() : '-'
          };
        });
      }}
      customActions={[
        {
          name: "viewDetails",
          label: "Ver Detalles",
          icon: "eye",
          variant: "outline-info",
          handler: (session) => {
            Swal.fire({
              title: "Detalle de Sesión",
              html: `
                <div style="text-align: left;">
                  <p><strong>ID:</strong> ${session.id || 'N/A'}</p>
                  <p><strong>User ID:</strong> ${session.user_id || 'N/A'}</p>
                  <p><strong>Token:</strong> ${session.token || 'N/A'}</p>
                  <p><strong>Expiración:</strong> ${session.expiration ? new Date(session.expiration).toLocaleString() : 'N/A'}</p>
                  <p><strong>Código 2FA:</strong> ${session.FACode || 'N/A'}</p>
                  <p><strong>Estado:</strong> ${session.state || 'N/A'}</p>
                  <p><strong>Creado:</strong> ${session.created_at ? new Date(session.created_at).toLocaleString() : 'N/A'}</p>
                  <p><strong>Actualizado:</strong> ${session.updated_at ? new Date(session.updated_at).toLocaleString() : 'N/A'}</p>
                </div>
              `,
              icon: "info",
              confirmButtonColor: "#10b981",
              confirmButtonText: "Cerrar"
            });
          }
        }
      ]}
      emptyMessage="📭 No hay sesiones registradas"
    />
  );
};

export default SessionView;
