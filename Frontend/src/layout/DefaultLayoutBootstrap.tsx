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
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Sidebar - Usando el componente genérico que funciona con todas las librerías */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content Area */}
        <div 
          className="d-flex flex-column min-vh-100"
          style={{
            marginLeft: window.innerWidth >= 992 ? '280px' : '0',
            transition: 'margin-left 0.3s ease',
          }}
        >
          {/* Header */}
          <HeaderBootstrap sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <main className="flex-grow-1">
            <Container fluid className="p-4 p-md-5">
              <Row>
                <Col>
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
