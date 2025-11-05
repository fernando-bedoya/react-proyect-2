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
