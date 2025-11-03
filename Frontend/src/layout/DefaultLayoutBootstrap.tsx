import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import HeaderBootstrap from '../components/HeaderBootstrap';
import Sidebar from '../components/Sidebar';

/**
 * DefaultLayoutBootstrap - Layout específico para Bootstrap
 * 
 * Este layout usa el componente Sidebar genérico en lugar de uno específico de Bootstrap,
 * maximizando la reutilización de código y asegurando consistencia visual.
 * El Sidebar.tsx está diseñado para funcionar con cualquier sistema de diseño.
 */
const DefaultLayoutBootstrap = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Provider store={store}>
      {/* 
        ✅ Layout usando flexbox horizontal para sidebar + contenido
        En desktop (>= 992px): sidebar (position: static, width: 290px) + contenido (flex: 1)
        En mobile (< 992px): solo contenido (sidebar se muestra como overlay con position: absolute)
      */}
      <div 
        className="d-flex min-vh-100" 
        style={{ 
          backgroundColor: '#f8f9fa',
          flexDirection: 'row', // ✅ Horizontal: sidebar a la izquierda, contenido a la derecha
          minHeight: '100vh'
        }}
      >
        {/* Sidebar - Usando el componente genérico que funciona con todas las librerías */}
        {/* En desktop: position static, width 290px (toma su espacio naturalmente) */}
        {/* En mobile: position absolute, overlay sobre el contenido */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content Area - Ocupa el resto del espacio disponible */}
        <div 
          className="d-flex flex-column min-vh-100"
          style={{
            // ✅ NO margin-left fijo - flexbox maneja el espaciado automáticamente
            // flex: 1 hace que ocupe todo el espacio disponible después del sidebar
            flex: '1 1 auto',
            minHeight: '100vh',
            width: '100%', // En mobile ocupa 100% (sidebar es overlay)
            maxWidth: '100%',
            overflow: 'hidden' // Previene scroll horizontal no deseado
          }}
        >
          {/* Header */}
          <HeaderBootstrap sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <main 
            className="flex-grow-1"
            style={{
              // ✅ Asegura que el contenido principal tenga width y padding correctos
              width: '100%',
              maxWidth: '100%',
              overflow: 'auto' // Permite scroll vertical si el contenido es largo
            }}
          >
            <Container 
              fluid 
              className="p-4 p-md-5"
              style={{
                // ✅ Padding inline para asegurar espaciado consistente
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                paddingTop: '1.5rem',
                paddingBottom: '1.5rem',
                maxWidth: '100%'
              }}
            >
              <Row style={{ margin: 0 }}>
                <Col style={{ padding: '0' }}>
                  <Outlet />
                </Col>
              </Row>
            </Container>
          </main>

          {/* Footer */}
          <footer 
            className="mt-auto py-4 border-top"
            style={{ 
              backgroundColor: 'white',
              borderColor: '#e5e7eb'
            }}
          >
            <Container fluid className="px-4 px-md-5">
              <Row>
                <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
                  <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} TailAdmin. Todos los derechos reservados.
                  </p>
                </Col>
                <Col md={6} className="text-center text-md-end">
                  <div className="d-flex gap-4 justify-content-center justify-content-md-end">
                    <a 
                      href="#" 
                      className="text-decoration-none text-muted"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Términos
                    </a>
                    <a 
                      href="#" 
                      className="text-decoration-none text-muted"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Privacidad
                    </a>
                    <a 
                      href="#" 
                      className="text-decoration-none text-muted"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Soporte
                    </a>
                  </div>
                </Col>
              </Row>
            </Container>
          </footer>
        </div>
      </div>
    </Provider>
  );
};

export default DefaultLayoutBootstrap;
