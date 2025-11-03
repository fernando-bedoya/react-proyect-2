import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../images/logo/logo.svg';

import { useSelector } from "react-redux";
import { RootState } from "../../src/store/store";

/**
 * Sidebar Component - Menú lateral de navegación
 * 
 * Componente simplificado que muestra únicamente las 3 opciones principales de administración:
 * - Users: Gestión de usuarios
 * - Roles: Gestión de roles
 * - Permissions: Gestión de permisos
 * 
 * Características:
 * - Fondo oscuro con degradado (gray-800 a gray-900) para mejor contraste visual
 * - Texto en gris claro (gray-300) que cambia a blanco en hover
 * - Cada ruta activa tiene un degradado de color único (azul, verde, púrpura)
 * - Iconos SVG personalizados para cada sección
 * - Responsive: se oculta en móviles y se muestra con botón hamburguesa
 * - Se cierra automáticamente al hacer click fuera o presionar ESC
 * 
 * @param sidebarOpen - Estado que indica si el sidebar está abierto (mobile)
 * @param setSidebarOpen - Función para cambiar el estado de apertura
 */
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  // Obtener usuario del store de Redux - solo muestra el sidebar si hay usuario autenticado
  const user = useSelector((state: RootState) => state.user.user);

  // Referencias para el sidebar y el botón trigger (para cerrar al click fuera)
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // Estado de expansión del sidebar (guardado en localStorage)
  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // Efecto: Cerrar sidebar al hacer click fuera de él
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Efecto: Cerrar sidebar al presionar tecla ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // Efecto: Guardar estado de expansión en localStorage y aplicar clase al body
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <div>
      {/* Estilos en línea para asegurar que el sidebar funcione en todas las librerías (Bootstrap, Tailwind, Material) */}
      <style>{`
        /* Estilos base del sidebar - funcionan con todas las librerías de diseño */
        aside[data-sidebar] {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 9999;
          display: flex;
          height: 100vh;
          width: 290px; /* w-72.5 de Tailwind = 290px - ancho fijo del sidebar */
          flex-direction: column;
          overflow-y: hidden;
          transition: transform 0.3s ease;
          flex-shrink: 0; /* ✅ Importante: evita que el sidebar se encoja cuando está en un flex container */
        }
        
        /* En desktop (>= 992px), el sidebar se comporta como estático */
        @media (min-width: 992px) {
          aside[data-sidebar] {
            position: static !important;
            transform: translateX(0) !important;
            /* ✅ Mantiene el ancho fijo de 290px en desktop para layout con flexbox */
            min-width: 290px;
            max-width: 290px;
          }
        }
        
        /* En mobile, ocultar el sidebar cuando está cerrado */
        aside[data-sidebar].sidebar-closed {
          transform: translateX(-100%);
        }
        
        /* En mobile, mostrar el sidebar cuando está abierto */
        aside[data-sidebar].sidebar-open {
          transform: translateX(0);
        }
      `}</style>
      
      {/* Solo mostrar sidebar si hay usuario autenticado */}
      {user ? (
        <aside
          ref={sidebar}
          data-sidebar
          className={`${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
          style={{
            // Borde que se adapta al modo claro/oscuro
            borderRight: '2px solid var(--bs-sidebar-hover)',
            // Fondo teal claro con degradado - consistente en todas las librerías
            background: 'linear-gradient(to bottom, #effdfa, #dff6f0)',
            color: '#07373a'
          }}
        >
          {/* SIDEBAR HEADER - Logo de la aplicación */}
          <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 border-b border-gray-700">
            <NavLink to="/">
              <img src={Logo} alt="Logo" />
            </NavLink>

            {/* Botón para cerrar sidebar en móvil */}
            <button
              ref={trigger}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              className="block lg:hidden"
            >
              <svg
                className="fill-current text-gray-400"
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                  fill=""
                />
              </svg>
            </button>
          </div>

          {/* SIDEBAR CONTENT - Scroll area */}
          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            {/* SIDEBAR MENU */}
            <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
              {/* Menu Group - Administración */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-400 uppercase tracking-wider">
                  ADMINISTRACIÓN
                </h3>

                {/* Lista de menús */}
                <ul className="mb-6 flex flex-col gap-2">
                  
                  {/* MENU ITEM: USERS */}
                  <li>
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      {/* Icono de Users - Grupo de personas */}
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 0C8.34315 0 7 1.34315 7 3C7 4.65685 8.34315 6 10 6C11.6569 6 13 4.65685 13 3C13 1.34315 11.6569 0 10 0ZM8.5 3C8.5 2.17157 9.17157 1.5 10 1.5C10.8284 1.5 11.5 2.17157 11.5 3C11.5 3.82843 10.8284 4.5 10 4.5C9.17157 4.5 8.5 3.82843 8.5 3Z"
                          fill=""
                        />
                        <path
                          d="M4 8C2.34315 8 1 9.34315 1 11C1 12.6569 2.34315 14 4 14C5.65685 14 7 12.6569 7 11C7 9.34315 5.65685 8 4 8ZM2.5 11C2.5 10.1716 3.17157 9.5 4 9.5C4.82843 9.5 5.5 10.1716 5.5 11C5.5 11.8284 4.82843 12.5 4 12.5C3.17157 12.5 2.5 11.8284 2.5 11Z"
                          fill=""
                        />
                        <path
                          d="M13 11C13 9.34315 14.3431 8 16 8C17.6569 8 19 9.34315 19 11C19 12.6569 17.6569 14 16 14C14.3431 14 13 12.6569 13 11ZM16 9.5C15.1716 9.5 14.5 10.1716 14.5 11C14.5 11.8284 15.1716 12.5 16 12.5C16.8284 12.5 17.5 11.8284 17.5 11C17.5 10.1716 16.8284 9.5 16 9.5Z"
                          fill=""
                        />
                        <path
                          d="M5.5 15C4.67157 15 4 15.6716 4 16.5V18.5C4 18.7761 3.77614 19 3.5 19C3.22386 19 3 18.7761 3 18.5V16.5C3 15.1193 4.11929 14 5.5 14H14.5C15.8807 14 17 15.1193 17 16.5V18.5C17 18.7761 16.7761 19 16.5 19C16.2239 19 16 18.7761 16 18.5V16.5C16 15.6716 15.3284 15 14.5 15H5.5Z"
                          fill=""
                        />
                      </svg>
                      <span className="font-semibold">Users</span>
                    </NavLink>
                  </li>

                  {/* MENU ITEM: ROLES */}
                  <li>
                    <NavLink
                      to="/roles/list"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      {/* Icono de Shield (Escudo) para Roles - Representa protección y permisos */}
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10 0C10.2652 0 10.5196 0.105357 10.7071 0.292893L18.7071 8.29289C18.8946 8.48043 19 8.73478 19 9V11C19 15.9706 14.9706 20 10 20C5.02944 20 1 15.9706 1 11V9C1 8.73478 1.10536 8.48043 1.29289 8.29289L9.29289 0.292893C9.48043 0.105357 9.73478 0 10 0ZM2.5 9.41421V11C2.5 15.1421 5.85786 18.5 10 18.5C14.1421 18.5 17.5 15.1421 17.5 11V9.41421L10 1.91421L2.5 9.41421Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10 3C10.4142 3 10.75 3.33579 10.75 3.75V11.25C10.75 11.6642 10.4142 12 10 12C9.58579 12 9.25 11.6642 9.25 11.25V3.75C9.25 3.33579 9.58579 3 10 3Z"
                          fill=""
                        />
                      </svg>
                      <span className="font-semibold">Roles</span>
                    </NavLink>
                  </li>

                  {/* MENU ITEM: PERMISSIONS */}
                  <li>
                    <NavLink
                      to="/permissions/list"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      {/* Icono de Key (Llave) para Permissions - Representa acceso y autorizaciones */}
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8 2C5.23858 2 3 4.23858 3 7C3 9.76142 5.23858 12 8 12C9.09534 12 10.1164 11.6471 10.9444 11.0555L16.2929 16.4041C16.6834 16.7946 17.3166 16.7946 17.7071 16.4041C18.0976 16.0136 18.0976 15.3804 17.7071 14.9899L12.3586 9.64142C12.9502 8.81341 13.3031 7.79241 13.3031 6.69707C13.3031 3.93565 11.0645 1.69707 8.30307 1.69707L8 2ZM5 7C5 5.34315 6.34315 4 8 4C9.65685 4 11 5.34315 11 7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7Z"
                          fill=""
                        />
                      </svg>
                      <span className="font-semibold">Permissions</span>
                    </NavLink>
                  </li>
                  
                </ul>
              </div>
            </nav>
            {/* Fin de Sidebar Menu */}
          </div>
        </aside>
      ) : (
        // Si no hay usuario, mostrar div vacío
        <div></div>
      )}
    </div>
  );
};

export default Sidebar;
