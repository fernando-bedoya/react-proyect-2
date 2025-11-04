import { useState } from 'react';
import AdaptiveHeader from '../components/AdaptiveHeader';
import AdaptiveSidebar from '../components/AdaptiveSidebar';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { useTheme } from '../context/ThemeContext';

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { designLibrary } = useTheme();

  // ✅ Estilos condicionales basados en la librería - OPTIMIZADOS PARA BOOTSTRAP
  // El problema era que las clases de Bootstrap causaban overflow y posicionamiento incorrecto
  const wrapperClasses = designLibrary === 'bootstrap' 
    ? 'min-vh-100' 
    : 'dark:bg-boxdark-2 dark:text-bodydark';

  // ✅ CAMBIO CRÍTICO: Usar flexbox horizontal (flex-row) para que sidebar y contenido fluyan lado a lado
  // ANTES: 'd-flex w-100 vh-100 overflow-hidden' causaba que el contenido quedara mal posicionado
  // AHORA: flexbox con dirección row permite que el sidebar (width: 290px) y el contenido (flex: 1) coexistan
  const layoutClasses = designLibrary === 'bootstrap'
    ? 'd-flex flex-row min-vh-100'
    : 'flex h-screen overflow-hidden';

  // ✅ CAMBIO CRÍTICO: Remover position-relative y usar flex: 1 para que ocupe espacio disponible
  // ANTES: 'position-relative d-flex flex-column flex-fill overflow-auto' causaba problemas de ancho
  // AHORA: el contenido usa flex-grow-1 para expandirse y tomar todo el espacio después del sidebar
  const contentClasses = designLibrary === 'bootstrap'
    ? 'd-flex flex-column flex-grow-1 overflow-auto'
    : 'relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden';

  // ✅ Padding apropiado para el contenido principal en Bootstrap
  const mainClasses = designLibrary === 'bootstrap'
    ? 'p-3 p-md-4 w-100'
    : 'mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10';

  return (
    <Provider store={store}>
      <div 
        className={wrapperClasses}
        style={{
          // ✅ Estilos inline específicos para Bootstrap que aseguran el fondo correcto
          ...(designLibrary === 'bootstrap' && { backgroundColor: '#f8f9fa' })
        }}
      >
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        <div 
          className={layoutClasses}
          style={{
            // ✅ Estilos inline para Bootstrap: asegurar layout horizontal correcto
            ...(designLibrary === 'bootstrap' && {
              minHeight: '100vh',
              width: '100%',
              maxWidth: '100%'
            })
          }}
        >
          {/* <!-- ===== Sidebar Start ===== --> */}
          {/* Usa el componente Sidebar genérico para todas las librerías de diseño */}
          {/* En desktop (>= 992px): sidebar es position: static con width: 290px (toma espacio naturalmente) */}
          {/* En mobile (< 992px): sidebar es position: absolute (overlay sobre el contenido) */}
          <AdaptiveSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          {/* ✅ El contenido usa flex-grow-1 para ocupar todo el espacio disponible después del sidebar */}
          {/* NO necesita margin-left porque flexbox maneja el espaciado automáticamente */}
          <div 
            className={contentClasses}
            style={{
              // ✅ Estilos inline para Bootstrap: asegurar que el contenido ocupe el espacio correcto
              ...(designLibrary === 'bootstrap' && {
                minHeight: '100vh',
                width: '100%',
                maxWidth: '100%'
              })
            }}
          >
            {/* <!-- ===== Header Start ===== --> */}
            <AdaptiveHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Start ===== --> */}
            <main
              style={{
                // ✅ Estilos para asegurar que el main ocupe el ancho completo en Bootstrap
                ...(designLibrary === 'bootstrap' && {
                  width: '100%',
                  maxWidth: '100%',
                  flex: '1 1 auto'
                })
              }}
            >
              <div 
                className={mainClasses}
                style={{
                  // ✅ Padding y ancho consistentes en Bootstrap para evitar que el contenido quede pegado
                  ...(designLibrary === 'bootstrap' && {
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  })
                }}
              >
                <Outlet />
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </Provider>
  );
};

export default DefaultLayout;
