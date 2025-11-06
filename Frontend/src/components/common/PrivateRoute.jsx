// PrivateRoute.jsx - Componente avanzado de protección de rutas con verificación de sesión y spinner
// Este componente verifica si el usuario tiene una sesión activa con validación asíncrona
// Sirve para proteger rutas privadas mostrando un spinner mientras verifica la sesión

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import * as userStorage from '../../utils/userStorage';

/**
 * Componente de protección de rutas con verificación asíncrona
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string} props.redirectTo - Ruta a la que redirigir si no está autenticado (default: "/login")
 * @param {boolean} props.showLoader - Mostrar spinner mientras verifica (default: true)
 * 
 * @example
 * // Uso básico
 * <Route path="/dashboard" element={
 *   <PrivateRoute>
 *     <Dashboard />
 *   </PrivateRoute>
 * } />
 * 
 * // Con ruta personalizada
 * <Route path="/admin" element={
 *   <PrivateRoute redirectTo="/auth/login">
 *     <AdminPanel />
 *   </PrivateRoute>
 * } />
 */
const PrivateRoute = ({ 
  children, 
  redirectTo = '/login', 
  showLoader = true 
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    /**
     * Verifica de forma asíncrona si el usuario está autenticado
     */
    const checkAuthentication = async () => {
  try {
  // Verificar si existe un token de acceso
  const token = localStorage.getItem('access_token');
  const storedUser = userStorage.getUser();
        
        // Opcional: Verificar si el token no ha expirado
        const tokenExpiry = localStorage.getItem('token_expiry');
        let isTokenValid = !!token;
        
        if (tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry);
          const currentTime = new Date().getTime();
          isTokenValid = currentTime < expiryTime;
          
          if (!isTokenValid) {
            console.warn('Token expirado. Cerrando sesión...');
          }
        }

        // Pequeño delay para mejor UX (opcional)
        if (showLoader) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

  // Determinar si el usuario está autenticado
  setIsAuthenticated(isTokenValid && !!storedUser);

      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthentication();
  }, [showLoader]);

  // Mostrar spinner mientras verifica la sesión
  if (isChecking && showLoader) {
    return (
      <Container 
        fluid 
        className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="text-center">
          {/* Spinner principal */}
          <Spinner 
            animation="border" 
            variant="primary"
            style={{ 
              width: '3rem', 
              height: '3rem',
              borderWidth: '3px'
            }} 
          />
          
          {/* Texto de carga */}
          <div className="mt-3">
            <h5 className="text-muted mb-1">Verificando sesión</h5>
            <p className="text-muted small mb-0">Por favor espere...</p>
          </div>
          
          {/* Barra de progreso animada */}
          <div className="mt-3" style={{ width: '200px', margin: '0 auto' }}>
            <div className="progress" style={{ height: '3px' }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Si no está autenticado, limpiar sesión y redirigir
  if (!isAuthenticated) {
  // Limpiar datos de sesión
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  userStorage.clearUser();
  localStorage.removeItem('token_expiry');
    
    console.warn('⚠️ No hay sesión activa. Redirigiendo a:', redirectTo);
    
    // Redirigir al login
    return <Navigate to={redirectTo} replace />;
  }

  // Si está autenticado, renderizar el contenido protegido
  return <>{children}</>;
};

/**
 * Hook personalizado para verificar autenticación
 * Puede ser usado en cualquier componente
 * 
 * @returns {Object} - { isAuthenticated, user, logout }
 * 
 * @example
 * const { isAuthenticated, user, logout } = useAuth();
 */
export const useAuth = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  const getUser = () => {
    return userStorage.getUser();
  };

  const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  userStorage.clearUser();
  localStorage.removeItem('token_expiry');
    window.location.href = '/login';
  };

  return {
    isAuthenticated: isAuthenticated(),
    user: getUser(),
    logout,
  };
};

export default PrivateRoute;
