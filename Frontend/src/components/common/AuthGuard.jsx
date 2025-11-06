// AuthGuard.jsx - Componente de protección de rutas con verificación de sesión
// Este componente verifica si existe un token de acceso válido en localStorage
// Sirve para proteger rutas privadas, redirigiendo automáticamente a /login si no hay sesión activa

import React from 'react';
import { Navigate } from 'react-router-dom';
import * as userStorage from '../../utils/userStorage';

/**
 * Componente de protección de rutas (AuthGuard)
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string} props.redirectTo - Ruta a la que redirigir si no está autenticado (default: "/login")
 * 
 * @example
 * // En tu configuración de rutas
 * <Route path="/dashboard" element={
 *   <AuthGuard>
 *     <Dashboard />
 *   </AuthGuard>
 * } />
 */
const AuthGuard = ({ children, redirectTo = '/login' }) => {
  /**
   * Verifica si el usuario tiene una sesión activa
   * Busca el token de acceso en localStorage
   */
  const isAuthenticated = () => {
    // Verificar si existe un token de acceso
    const token = localStorage.getItem('access_token');
    
    // También puedes verificar si el token no ha expirado
    // const tokenExpiry = localStorage.getItem('token_expiry');
    // const isExpired = tokenExpiry ? new Date().getTime() > parseInt(tokenExpiry) : true;
    
    return !!token; // Devuelve true si existe el token
  };

  // Si no hay sesión activa, redirigir al login
  if (!isAuthenticated()) {
  // Limpiar cualquier dato residual de sesión
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  userStorage.clearUser();
    
    console.warn('No hay sesión activa. Redirigiendo a:', redirectTo);
    
    // Redirigir al login (replace evita que el usuario pueda volver con el botón atrás)
    return <Navigate to={redirectTo} replace />;
  }

  // Si hay sesión activa, renderizar el contenido protegido
  return <>{children}</>;
};

export default AuthGuard;
