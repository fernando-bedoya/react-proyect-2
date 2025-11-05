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

import React, { useEffect, useState } from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';
import GenericTable from '../../components/GenericTable';
import { useLocation } from 'react-router-dom';
import sessionService from '../../services/sessionService';
import { userService } from '../../services/userService';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const SessionView: React.FC = () => {
  const location = useLocation();
  const [filteredSessions, setFilteredSessions] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showAll, setShowAll] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userIdParam = params.get('userId');
    // Always preload users for mapping
    userService.getUsers().then(u => setUsers(u || [])).catch(() => setUsers([]));

    if (userIdParam) {
      const uid = Number(userIdParam);
      if (!Number.isNaN(uid)) {
        setLoading(true);
        sessionService.getSessionsByUserId(uid).then(sessions => {
          setFilteredSessions(sessions || []);
        }).catch(err => {
          console.error('Error cargando sesiones filtradas:', err);
          setFilteredSessions([]);
        }).finally(() => setLoading(false));
      }
    } else {
      setFilteredSessions(null); // use GenericCRUDView (all sessions)
    }
  }, [location.search]);

  // Controls: allow toggling between all sessions (CRUD) or filtered by userId
  const handleToggle = () => setShowAll(s => !s);

  // Custom handler to create a session using sessionService.createSession
  // GenericCRUDView by default posts to POST /sessions which may not match
  // the backend API that expects POST /sessions/user/:userId. We provide
  // this handler to ensure the correct endpoint is used and to convert
  // the datetime-local value into the backend-expected format.
  const customCreateHandler = async (formData: any) => {
    try {
      const userId = Number(formData.user_id ?? formData.userId ?? formData.user);
      if (!userId || Number.isNaN(userId)) {
        throw new Error('Usuario inválido. Seleccione un usuario válido.');
      }

      const payload: any = { ...formData };

      // If the form includes user_id in the body, backend expects it in the URL
      // so remove it from payload to avoid duplication (server may ignore it but be safe)
      delete payload.user_id;

      // GENERAR TOKEN AUTOMÁTICAMENTE si no viene en el form. Se usará como token de sesión
      const generateRandomToken = () => {
        try {
          // Preferir crypto.randomUUID cuando esté disponible
          if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
            return (crypto as any).randomUUID();
          }
          // Fallback a getRandomValues (navegador)
          if (typeof window !== 'undefined' && (window as any).crypto && (window as any).crypto.getRandomValues) {
            const arr = new Uint8Array(16);
            (window as any).crypto.getRandomValues(arr);
            return Array.from(arr).map((b: number) => b.toString(16).padStart(2, '0')).join('');
          }
        } catch (e) {
          // ignore and fallback
        }
        // Último recurso: timestamp + random
        return 'tk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      };

      // Si existe un token de sesión en localStorage (Bearer), usarlo como token generado
      const existingBearer = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
      if (existingBearer) {
        payload.token = existingBearer;
      } else if (!payload.token) {
        payload.token = generateRandomToken();
      }

      // Normalize expiration value. GenericForm sends datetime-local like "YYYY-MM-DDTHH:MM"
      // Backend expects "YYYY-MM-DD HH:MM:SS". Preserve seconds as :00 when absent.
      if (payload.expiration && typeof payload.expiration === 'string') {
        // Convert "2025-11-05T14:30" -> "2025-11-05 14:30:00"
        payload.expiration = payload.expiration.replace('T', ' ');
        if (!payload.expiration.match(/:\d{2}:\d{2}$/)) {
          // If seconds absent, append :00
          if (payload.expiration.match(/:\d{2}$/)) payload.expiration = payload.expiration + ':00';
        }
      }

      // Call the sessionService helper which posts to /sessions/user/:userId
      const created = await sessionService.createSession(userId, payload);

      // Let the caller (GenericCRUDView) refresh the list. Provide a user-friendly message
      await Swal.fire({ title: 'Sesión creada', text: 'La sesión se creó en el backend correctamente.', icon: 'success', confirmButtonColor: '#10b981' });
      return created;
    } catch (err: any) {
      console.error('Error creando sesión manualmente:', err);
      await Swal.fire({ title: 'Error', text: err?.response?.data?.message || err?.message || 'Error creando sesión', icon: 'error', confirmButtonColor: '#ef4444' });
      throw err;
    }
  };

  // If showAll is true, render the full CRUD view
  if (showAll) {
    return (
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h2 fw-bold mb-0">🔐 Sesiones</h2>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={showAll} id="showAllSessions" onChange={handleToggle} />
            <label className="form-check-label" htmlFor="showAllSessions">Mostrar todas las sesiones</label>
          </div>
        </div>

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
          // Token se genera automáticamente al enviar el formulario; no se muestra en la UI
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
        // Use a custom create handler so the session is created via POST /sessions/user/:userId
        // and the expiration value is converted to the expected format.
        customCreateHandler={customCreateHandler}
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
            icon: "view",
            variant: "info",
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
      </div>
    );
  }

  // Si hay filteredSessions (query userId), render a simple table with those sesiones
  const transformed = (filteredSessions || []).map((session: any) => {
    const user = users.find(u => u.id === session.user_id);
    return {
      ...session,
      user_email: user?.email || `Usuario ${session.user_id}`,
      expiration: session.expiration ? new Date(session.expiration).toLocaleString() : '-',
      created_at: session.created_at ? new Date(session.created_at).toLocaleString() : '-'
    };
  });

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h2 fw-bold mb-0">🔐 Sesiones</h2>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" checked={showAll} id="showAllSessionsBottom" onChange={handleToggle} />
          <label className="form-check-label" htmlFor="showAllSessionsBottom">Mostrar todas las sesiones</label>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <GenericTable
          data={transformed}
          columns={["id", "user_email", "expiration", "state", "created_at"]}
          columnLabels={{ id: 'ID', user_email: 'Usuario', expiration: 'Expiración', state: 'Estado', created_at: 'Fecha Creación' }}
          actions={[{ name: 'viewDetails', label: 'Ver Detalles', icon: 'view', variant: 'info' }]}
          onAction={(action, item) => {
            if (action === 'viewDetails') {
              Swal.fire({
                title: 'Detalle de Sesión',
                html: `
                  <div style="text-align: left;">
                    <p><strong>ID:</strong> ${item.id || 'N/A'}</p>
                    <p><strong>User ID:</strong> ${item.user_id || 'N/A'}</p>
                    <p><strong>Token:</strong> ${item.token || 'N/A'}</p>
                    <p><strong>Expiración:</strong> ${item.expiration || 'N/A'}</p>
                    <p><strong>Código 2FA:</strong> ${item.FACode || 'N/A'}</p>
                    <p><strong>Estado:</strong> ${item.state || 'N/A'}</p>
                    <p><strong>Creado:</strong> ${item.created_at || 'N/A'}</p>
                  </div>
                `,
                icon: 'info',
                confirmButtonColor: '#10b981'
              });
            }
          }}
          emptyMessage="📭 No hay sesiones para este usuario"
        />
      )}
    </div>
  );
};

export default SessionView;
