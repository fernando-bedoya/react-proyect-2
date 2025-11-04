import { Link } from 'react-router-dom';
import Logo from '../images/logo/logo-icon.svg';
import DropdownUser from './DropdownUser';
import ThemeSelector from './ThemeSelector';
import { useTheme } from '../context/ThemeContext';

/**
 * 🎯 Header - Componente de encabezado genérico y adaptable con selector de tema
 * 
 * Este componente se adapta automáticamente al tema activo (Bootstrap, Tailwind, Material)
 * aplicando las clases CSS correspondientes según la librería de diseño seleccionada.
 * 
 * CARACTERÍSTICAS:
 * - ✅ Funciona con Bootstrap, Tailwind y Material UI sin necesidad de componentes separados
 * - ✅ Incluye botón hamburguesa para toggle del sidebar en móvil
 * - ✅ Barra de búsqueda responsive (oculta en móvil)
 * - ✅ Selector de tema (ThemeSelector) integrado en la barra de navegación
 * - ✅ Dropdown de perfil de usuario con opciones de configuración y logout
 * - ✅ Colores dinámicos según tema: Bootstrap=Verde, Tailwind=Azul, Material=Amarillo
 * - ✅ Estilos inline para Bootstrap que garantizan posicionamiento correcto
 */

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { designLibrary } = useTheme();

  // 🎨 Configuración de colores por tema (Bootstrap=Verde, Tailwind=Azul, Material=Amarillo)
  const themeColors = {
    bootstrap: {
      bg: '#10b981', // verde
      bgLight: '#d1fae5',
      border: '#10b981',
      text: '#065f46'
    },
    tailwind: {
      bg: '#3b82f6', // azul
      bgLight: '#dbeafe',
      border: '#3b82f6',
      text: '#1e40af'
    },
    material: {
      bg: '#f59e0b', // amarillo
      bgLight: '#fef3c7',
      border: '#f59e0b',
      text: '#92400e'
    }
  };

  const colors = themeColors[designLibrary];

  // ✅ Clases condicionales basadas en la librería de diseño activa
  const headerClasses = designLibrary === 'bootstrap'
    ? 'sticky-top shadow-sm border-bottom'
    : 'sticky top-0 z-999 flex w-full drop-shadow-1 dark:drop-shadow-none';

  const containerClasses = designLibrary === 'bootstrap'
    ? 'd-flex flex-grow-1 align-items-center justify-content-between py-3 px-4 px-md-6'
    : 'flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11';

  return (
    <header 
      className={headerClasses}
      style={{
        // 🎨 Aplicar color de fondo según el tema activo con degradado sutil
        background: `linear-gradient(to right, ${colors.bgLight}, white)`,
        borderBottom: `3px solid ${colors.border}`,
        zIndex: 999,
        width: '100%',
        transition: 'all 0.3s ease' // Transición suave al cambiar de tema
      }}
    >
      <div 
        className={containerClasses}
        style={{
          // ✅ Asegurar que el contenedor del header ocupe todo el ancho en Bootstrap
          ...(designLibrary === 'bootstrap' && {
            width: '100%',
            maxWidth: '100%'
          })
        }}
      >
        {/* ✅ Sección izquierda: Hamburguesa + Logo (solo móvil) */}
        <div className={designLibrary === 'bootstrap' ? 'd-flex align-items-center gap-2 d-lg-none' : 'flex items-center gap-2 sm:gap-4 lg:hidden'}>
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className={designLibrary === 'bootstrap' ? 'btn btn-link text-dark p-0' : 'z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark'}
            style={{
              // ✅ Estilos inline para el botón hamburguesa en Bootstrap
              ...(designLibrary === 'bootstrap' && {
                fontSize: '1.5rem',
                textDecoration: 'none'
              })
            }}
          >
            {designLibrary === 'bootstrap' ? (
              // ✅ Icono simple para Bootstrap
              props.sidebarOpen ? <span>✕</span> : <span>☰</span>
            ) : (
              // Icono animado para Tailwind/Material
              <span className="relative block h-5.5 w-5.5 cursor-pointer">
                <span className="du-block absolute right-0 h-full w-full">
                  <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!w-full delay-300'
                    }`}
                  ></span>
                  <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && 'delay-400 !w-full'
                    }`}
                  ></span>
                  <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!w-full delay-500'
                    }`}
                  ></span>
                </span>
                <span className="absolute right-0 h-full w-full rotate-45">
                  <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                  ></span>
                  <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!h-0 !delay-200'
                    }`}
                  ></span>
                </span>
              </span>
            )}
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link 
            className={designLibrary === 'bootstrap' ? 'd-block d-lg-none' : 'block flex-shrink-0 lg:hidden'} 
            to="/"
          >
            <img src={Logo} alt="Logo" height="32" />
          </Link>
        </div>

        {/* ✅ Barra de búsqueda - oculta en móvil, visible en tablet/desktop */}
        <div className={designLibrary === 'bootstrap' ? 'd-none d-sm-flex flex-grow-1 me-4' : 'hidden sm:block'} style={{ maxWidth: '400px' }}>
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className={designLibrary === 'bootstrap' ? 'position-relative' : 'relative'}>
              <button className={designLibrary === 'bootstrap' ? 'position-absolute top-50 start-0 translate-middle-y border-0 bg-transparent' : 'absolute top-1/2 left-0 -translate-y-1/2'}>
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className={designLibrary === 'bootstrap' ? 'form-control border-0 shadow-none' : 'w-full bg-transparent pr-4 pl-9 focus:outline-none'}
                style={{
                  ...(designLibrary === 'bootstrap' && {
                    paddingLeft: '2.5rem'
                  })
                }}
              />
            </div>
          </form>
        </div>

        {/* ✅ Sección derecha: Selector de tema + Perfil de usuario */}
        <div className={designLibrary === 'bootstrap' ? 'd-flex align-items-center gap-3 ms-auto' : 'flex items-center gap-4 2xsm:gap-7'}>
          {/* 🎨 Selector de tema - permite cambiar entre Bootstrap, Tailwind y Material */}
          <ThemeSelector />
          
          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
