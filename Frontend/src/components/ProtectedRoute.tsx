// ProtectedRoute.tsx - Guardián de rutas privadas (Route Guard)
// 🛡️ Este componente actúa como un GUARDIÁN (Guard) que intercepta el acceso a rutas protegidas
// 🔒 Implementa un sistema de autenticación robusto que verifica tokens, sesiones y estado de Redux
// 🚦 Funciona como INTERCEPTOR al verificar cada intento de acceso antes de permitir el paso
// ⚡ Sincroniza el estado de autenticación entre localStorage, SecurityService y Redux Store

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SecurityService from '../services/securityService';
import { setUser } from '../store/userSlice';
import { RootState } from '../store/store';
import * as userStorage from '../utils/userStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 🛡️ GUARDIÁN DE RUTAS (Route Guard) 
 * Componente que implementa el patrón Guard/Interceptor para proteger rutas privadas
 * 
 * Flujo de verificación (interceptor de 3 capas):
 * 1. Verifica token en localStorage (primera capa - persistencia)
 * 2. Valida con SecurityService (segunda capa - lógica de negocio)
 * 3. Sincroniza con Redux Store (tercera capa - estado global)
 * 
 * Si alguna capa falla, redirige al login y limpia toda la sesión
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation(); // Para guardar la ruta a la que intentaba acceder
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    // 🔍 FUNCIÓN INTERCEPTORA: Verifica autenticación en múltiples capas
    const checkAuth = async () => {
      try {
        console.log('🛡️ Guard: Interceptando acceso a ruta protegida:', location.pathname);
        
  // 🔐 CAPA 1: Verificar tokens en localStorage (persistencia)
  const accessToken = localStorage.getItem('access_token');
  const storedUser = userStorage.getUser();
        
        if (!accessToken) {
          console.log('❌ Guard: No hay token de acceso - Acceso denegado');
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }
        
        // 🔐 CAPA 2: Validar con SecurityService (lógica de negocio)
        const authStatus = SecurityService.isAuthenticated();
        
        if (!authStatus) {
          console.log('❌ Guard: SecurityService reporta sesión inválida - Acceso denegado');
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }
        
        // 🔐 CAPA 3: Sincronizar con Redux Store (estado global)
        // Si hay usuario en localStorage pero no en Redux, restaurar el estado
        if (storedUser && !reduxUser) {
          try {
            console.log('🔄 Guard: Restaurando usuario en Redux desde userStorage');
            dispatch(setUser(storedUser as any));
          } catch (error) {
            console.error('❌ Guard: Error al restaurar usuario desde userStorage:', error);
          }
        }
        
        // ✅ TODAS LAS CAPAS VALIDADAS: Permitir acceso
        console.log('✅ Guard: Autenticación verificada - Acceso permitido');
        
        // Pequeño delay para UX suave (opcional)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Guard: Error en verificación de autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [location.pathname, dispatch, reduxUser]);

  // Mostrar spinner mientras verifica la sesión
  if (isChecking) {
    return (
      <Container 
        fluid 
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="text-center">
          <Spinner 
            animation="border" 
            style={{ 
              width: '4rem', 
              height: '4rem',
              color: '#10b981',
              borderWidth: '4px'
            }} 
          />
          <div className="mt-4">
            <h5 className="text-muted mb-2">Verificando sesión</h5>
            <p className="text-muted small">Por favor espere...</p>
          </div>
          
          {/* Indicador de progreso visual adicional */}
          <div className="mt-4" style={{ width: '200px', margin: '0 auto' }}>
            <div className="progress" style={{ height: '4px' }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ 
                  width: '100%',
                  backgroundColor: '#10b981'
                }}
              ></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // 🚫 ACCESO DENEGADO: Usuario no autenticado
  if (!isAuthenticated) {
    console.log('🚫 Guard: Acceso denegado - Redirigiendo a login');
    console.log('📍 Guard: Guardando ruta de destino:', location.pathname);
    
  // 🧹 LIMPIEZA COMPLETA DE SESIÓN (interceptor de limpieza)
  // Eliminar todos los tokens y datos de usuario de localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  userStorage.clearUser();
    
    // Limpiar Redux Store también
    dispatch(setUser(null));
    
    // Redirigir al login con la ruta de origen guardada (para redirigir después del login)
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }

  // ✅ ACCESO PERMITIDO: Usuario autenticado, mostrar contenido protegido
  console.log('✅ Guard: Renderizando contenido protegido');
  return <>{children}</>;
};

export default ProtectedRoute;
