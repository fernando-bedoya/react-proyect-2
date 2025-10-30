import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import SecurityService from '../services/securityService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente Guard para rutas protegidas
 * Muestra un Spinner de Bootstrap mientras verifica la sesión
 * Redirige al login si no hay sesión activa
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simular verificación de sesión (puedes agregar lógica real aquí)
        const authStatus = SecurityService.isAuthenticated();
        
        // Pequeño delay para mostrar el spinner (opcional, solo para UX)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

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

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
