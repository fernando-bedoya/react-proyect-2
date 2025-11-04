import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../images/logo/logo.svg';

import { useSelector } from "react-redux";
import { RootState } from "../../src/store/store";

/**
 * 🎯 Sidebar Component - Menú lateral de navegación con estructura jerárquica completa
 * 
 * 📋 ESTRUCTURA DEL MENÚ (4 GRUPOS PRINCIPALES):
 * 
 * 👥 USER MANAGEMENT (Gestión de Usuarios):
 *    - Users List: Listado de usuarios del sistema
 *    - Create User: Crear nuevo usuario
 *    - Assign Roles: Asignar roles a usuarios
 *    - Roles List: Listado de roles
 *    - Create Role: Crear nuevo rol
 *    - User Roles: Gestión de roles de usuarios
 * 
 * 🔒 SECURITY & ACCESS (Seguridad y Acceso):
 *    - Permissions List: Listado de permisos
 *    - Create Permission: Crear nuevo permiso
 *    - Admin Permissions: Permisos de administrador
 *    - Permissions-Roles: Relación permisos-roles
 *    - Passwords List: Listado de contraseñas
 *    - Create Password: Crear nueva contraseña
 *    - Sessions List: Listado de sesiones
 *    - Create Session: Crear nueva sesión
 *    - Security Questions: Preguntas de seguridad
 *    - Answers: Respuestas a preguntas de seguridad
 * 
 * 📍 DATA & RESOURCES (Datos y Recursos):
 *    - Create Address: Crear dirección
 *    - Devices: Gestión de dispositivos
 *    - Firebase: Integración con Firebase
 *    - Digital Signatures: Firmas digitales
 * 
 * 🔐 AUTHENTICATION (Autenticación):
 *    - Sign Up: Registro de nuevos usuarios
 * 
 * 🎨 Características visuales:
 * - Fondo teal claro con degradado (#effdfa → #dff6f0)
 * - Cada ruta activa tiene un degradado de color único
 * - Iconos SVG personalizados para cada sección
 * - Responsive: se oculta en móviles, visible en desktop (>= 992px)
 * - Se cierra automáticamente al hacer click fuera o presionar ESC
 * 
 * 🔧 Funcionalidad:
 * - NavLink de React Router para navegación
 * - Solo visible si hay usuario autenticado (Redux)
 * - Estado guardado en localStorage
 * - Scroll suave para navegación de muchas opciones
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
              
              {/* ========================================== */}
              {/* 📋 GRUPO 1: USER MANAGEMENT */}
              {/* Gestión completa de usuarios, roles y asignaciones */}
              {/* ========================================== */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#07373a' }}>
                  👥 USER MANAGEMENT
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  
                  {/* 👤 MENU ITEM: Users List - Listado de usuarios */}
                  <li>
                    <NavLink
                      to="/users/list"
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
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C8.34315 0 7 1.34315 7 3C7 4.65685 8.34315 6 10 6C11.6569 6 13 4.65685 13 3C13 1.34315 11.6569 0 10 0ZM8.5 3C8.5 2.17157 9.17157 1.5 10 1.5C10.8284 1.5 11.5 2.17157 11.5 3C11.5 3.82843 10.8284 4.5 10 4.5C9.17157 4.5 8.5 3.82843 8.5 3Z" fill=""/>
                        <path d="M4 8C2.34315 8 1 9.34315 1 11C1 12.6569 2.34315 14 4 14C5.65685 14 7 12.6569 7 11C7 9.34315 5.65685 8 4 8ZM2.5 11C2.5 10.1716 3.17157 9.5 4 9.5C4.82843 9.5 5.5 10.1716 5.5 11C5.5 11.8284 4.82843 12.5 4 12.5C3.17157 12.5 2.5 11.8284 2.5 11Z" fill=""/>
                        <path d="M13 11C13 9.34315 14.3431 8 16 8C17.6569 8 19 9.34315 19 11C19 12.6569 17.6569 14 16 14C14.3431 14 13 12.6569 13 11ZM16 9.5C15.1716 9.5 14.5 10.1716 14.5 11C14.5 11.8284 15.1716 12.5 16 12.5C16.8284 12.5 17.5 11.8284 17.5 11C17.5 10.1716 16.8284 9.5 16 9.5Z" fill=""/>
                        <path d="M5.5 15C4.67157 15 4 15.6716 4 16.5V18.5C4 18.7761 3.77614 19 3.5 19C3.22386 19 3 18.7761 3 18.5V16.5C3 15.1193 4.11929 14 5.5 14H14.5C15.8807 14 17 15.1193 17 16.5V18.5C17 18.7761 16.7761 19 16.5 19C16.2239 19 16 18.7761 16 18.5V16.5C16 15.6716 15.3284 15 14.5 15H5.5Z" fill=""/>
                      </svg>
                      <span className="font-semibold">Users List</span>
                    </NavLink>
                  </li>

                  {/* ➕ MENU ITEM: Create User - Crear nuevo usuario */}
                  <li>
                    <NavLink
                      to="/users/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-sky-600 to-sky-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C8.34315 0 7 1.34315 7 3C7 4.65685 8.34315 6 10 6C11.6569 6 13 4.65685 13 3C13 1.34315 11.6569 0 10 0Z" fill=""/>
                        <path d="M5.5 15C4.67157 15 4 15.6716 4 16.5V18.5H16V16.5C16 15.6716 15.3284 15 14.5 15H5.5Z" fill=""/>
                        <path d="M15 8H17V10H19V12H17V14H15V12H13V10H15V8Z" fill=""/>
                      </svg>
                      <span className="font-semibold">Create User</span>
                    </NavLink>
                  </li>

                  {/* 🔗 MENU ITEM: Assign Roles - Asignar roles a usuarios */}
                  <li>
                    <NavLink
                      to="/users/assign-roles"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z" fill=""/>
                        <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18H3Z" fill=""/>
                        <path d="M15 5C15.5523 5 16 4.55228 16 4C16 3.44772 15.5523 3 15 3C14.4477 3 14 3.44772 14 4C14 4.55228 14.4477 5 15 5Z" fill=""/>
                        <path d="M18.5 8L15 6L11.5 8V3H18.5V8Z" fill="" opacity="0.5"/>
                      </svg>
                      <span className="font-semibold">Assign Roles</span>
                    </NavLink>
                  </li>

                  {/* 🛡️ MENU ITEM: Roles List - Listado de roles */}
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
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 0C10.2652 0 10.5196 0.105357 10.7071 0.292893L18.7071 8.29289C18.8946 8.48043 19 8.73478 19 9V11C19 15.9706 14.9706 20 10 20C5.02944 20 1 15.9706 1 11V9C1 8.73478 1.10536 8.48043 1.29289 8.29289L9.29289 0.292893C9.48043 0.105357 9.73478 0 10 0ZM2.5 9.41421V11C2.5 15.1421 5.85786 18.5 10 18.5C14.1421 18.5 17.5 15.1421 17.5 11V9.41421L10 1.91421L2.5 9.41421Z" fill=""/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 3C10.4142 3 10.75 3.33579 10.75 3.75V11.25C10.75 11.6642 10.4142 12 10 12C9.58579 12 9.25 11.6642 9.25 11.25V3.75C9.25 3.33579 9.58579 3 10 3Z" fill=""/>
                      </svg>
                      <span className="font-semibold">Roles List</span>
                    </NavLink>
                  </li>

                  {/* ➕ MENU ITEM: Create Role - Crear nuevo rol */}
                  <li>
                    <NavLink
                      to="/roles/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2L3 5V9C3 13.5 6 17 10 18C14 17 17 13.5 17 9V5L10 2Z" fill="" opacity="0.5"/>
                        <path d="M10 7V13M7 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Create Role</span>
                    </NavLink>
                  </li>

                  {/* 🔗 MENU ITEM: User Roles - Gestión de roles de usuarios */}
                  <li>
                    <NavLink
                      to="/user-roles"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-violet-600 to-violet-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="6" r="3" fill=""/>
                        <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18H3Z" fill=""/>
                        <circle cx="15" cy="15" r="3" fill="" opacity="0.7"/>
                      </svg>
                      <span className="font-semibold">User Roles</span>
                    </NavLink>
                  </li>
                  
                </ul>
              </div>

              {/* ========================================== */}
              {/* 🔒 GRUPO 2: SECURITY & ACCESS */}
              {/* Gestión de permisos, contraseñas, sesiones y seguridad */}
              {/* ========================================== */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#07373a' }}>
                  🔒 SECURITY & ACCESS
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  
                  {/* 🔑 MENU ITEM: Permissions List - Listado de permisos */}
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
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 7C14 4.23858 11.7614 2 9 2C6.23858 2 4 4.23858 4 7C4 9.41987 5.72757 11.4349 8 11.9V18H10V11.9C12.2724 11.4349 14 9.41987 14 7ZM9 10C7.34315 10 6 8.65685 6 7C6 5.34315 7.34315 4 9 4C10.6569 4 12 5.34315 12 7C12 8.65685 10.6569 10 9 10Z" fill=""/>
                        <circle cx="9" cy="7" r="1.5" fill=""/>
                      </svg>
                      <span className="font-semibold">Permissions List</span>
                    </NavLink>
                  </li>

                  {/* ➕ MENU ITEM: Create Permission - Crear nuevo permiso */}
                  <li>
                    <NavLink
                      to="/permissions/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 7C14 4.23858 11.7614 2 9 2C6.23858 2 4 4.23858 4 7C4 9.41987 5.72757 11.4349 8 11.9V18H10V11.9C12.2724 11.4349 14 9.41987 14 7Z" fill=""/>
                        <path d="M15 14H17V16H19V18H17V20H15V18H13V16H15V14Z" fill=""/>
                      </svg>
                      <span className="font-semibold">Create Permission</span>
                    </NavLink>
                  </li>

                  {/* 🔐 MENU ITEM: Administrator Permissions - Permisos de administrador */}
                  <li>
                    <NavLink
                      to="/administrator/permissions"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-pink-600 to-pink-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2L3 5V9C3 13.5 6 17 10 18C14 17 17 13.5 17 9V5L10 2Z" fill="" opacity="0.3"/>
                        <path d="M10 6C8.89543 6 8 6.89543 8 8C8 9.10457 8.89543 10 10 10C11.1046 10 12 9.10457 12 8C12 6.89543 11.1046 6 10 6Z" fill=""/>
                        <path d="M10 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Admin Permissions</span>
                    </NavLink>
                  </li>

                  {/* � MENU ITEM: Permissions-Roles - Relación permisos-roles */}
                  <li>
                    <NavLink
                      to="/permissions-roles/list"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="10" r="3" fill=""/>
                        <circle cx="15" cy="10" r="3" fill=""/>
                        <path d="M8 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Permissions-Roles</span>
                    </NavLink>
                  </li>

                  {/* 🔑 MENU ITEM: Passwords List - Listado de contraseñas */}
                  <li>
                    <NavLink
                      to="/passwords/list"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="8" width="14" height="10" rx="2" fill="" opacity="0.3"/>
                        <path d="M6 8V6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="10" cy="13" r="1.5" fill="currentColor"/>
                      </svg>
                      <span className="font-semibold">Passwords List</span>
                    </NavLink>
                  </li>

                  {/* ➕ MENU ITEM: Create Password - Crear nueva contraseña */}
                  <li>
                    <NavLink
                      to="/passwords/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="8" width="14" height="10" rx="2" fill="" opacity="0.3"/>
                        <path d="M6 8V6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 11V15M8 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Create Password</span>
                    </NavLink>
                  </li>

                  {/* 🕐 MENU ITEM: Sessions List - Listado de sesiones */}
                  <li>
                    <NavLink
                      to="/sessions/list"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Sessions List</span>
                    </NavLink>
                  </li>

                  {/* ➕ MENU ITEM: Create Session - Crear nueva sesión */}
                  <li>
                    <NavLink
                      to="/sessions/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="15" cy="15" r="3" fill="currentColor"/>
                        <path d="M15 13V17M13 15H17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Create Session</span>
                    </NavLink>
                  </li>

                  {/* ❓ MENU ITEM: Security Questions - Preguntas de seguridad */}
                  <li>
                    <NavLink
                      to="/security-questions"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-lime-600 to-lime-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M10 7C9.20435 7 8.44129 7.31607 7.87868 7.87868C7.31607 8.44129 7 9.20435 7 10H8.5C8.5 9.60218 8.65804 9.22064 8.93934 8.93934C9.22064 8.65804 9.60218 8.5 10 8.5C10.3978 8.5 10.7794 8.65804 11.0607 8.93934C11.342 9.22064 11.5 9.60218 11.5 10C11.5 11.5 9.5 11.5 9.5 13H11C11 11.75 13 11.5 13 10C13 9.20435 12.6839 8.44129 12.1213 7.87868C11.5587 7.31607 10.7956 7 10 7Z" fill=""/>
                        <circle cx="10" cy="15" r="1" fill=""/>
                      </svg>
                      <span className="font-semibold">Security Questions</span>
                    </NavLink>
                  </li>

                  {/* 💬 MENU ITEM: Answers - Respuestas */}
                  <li>
                    <NavLink
                      to="/answers"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V12C18 13.1046 17.1046 14 16 14H11L6 18V14H4C2.89543 14 2 13.1046 2 12V4Z" fill="" opacity="0.5"/>
                        <path d="M6 7H14M6 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Answers</span>
                    </NavLink>
                  </li>
                  
                </ul>
              </div>

              {/* ========================================== */}
              {/* 📍 GRUPO 3: DATA & RESOURCES */}
              {/* Gestión de direcciones, dispositivos y recursos */}
              {/* ========================================== */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#07373a' }}>
                  📍 DATA & RESOURCES
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  
                  {/* 📍 MENU ITEM: Create Address - Crear dirección */}
                  <li>
                    <NavLink
                      to="/addresses/create"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2C7.24 2 5 4.24 5 7C5 11.25 10 18 10 18C10 18 15 11.25 15 7C15 4.24 12.76 2 10 2ZM10 9C8.9 9 8 8.1 8 7C8 5.9 8.9 5 10 5C11.1 5 12 5.9 12 7C12 8.1 11.1 9 10 9Z" fill=""/>
                        <circle cx="15" cy="15" r="3" fill="currentColor"/>
                        <path d="M15 13V17M13 15H17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Create Address</span>
                    </NavLink>
                  </li>

                  {/* 📱 MENU ITEM: Devices - Dispositivos */}
                  <li>
                    <NavLink
                      to="/devices"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-slate-600 to-slate-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="2" width="12" height="16" rx="2" fill="" opacity="0.3"/>
                        <rect x="6" y="4" width="8" height="10" rx="1" fill="currentColor"/>
                        <rect x="8" y="15" width="4" height="1" rx="0.5" fill="currentColor"/>
                      </svg>
                      <span className="font-semibold">Devices</span>
                    </NavLink>
                  </li>

                  {/* 🔥 MENU ITEM: Firebase - Integración Firebase */}
                  <li>
                    <NavLink
                      to="/firebase"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.5 16L10 3L12.5 8L10.5 11.5L3.5 16Z" fill="" opacity="0.5"/>
                        <path d="M10.5 11.5L16.5 16L10 18L3.5 16L10.5 11.5Z" fill="currentColor"/>
                        <circle cx="12.5" cy="8" r="1.5" fill="currentColor"/>
                      </svg>
                      <span className="font-semibold">Firebase</span>
                    </NavLink>
                  </li>

                  {/* ✍️ MENU ITEM: Digital Signatures - Firmas digitales */}
                  <li>
                    <NavLink
                      to="/digital-signatures"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-blue-700 to-indigo-600 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3H17V17H3V3Z" fill="" opacity="0.2"/>
                        <path d="M5 15L8 12L11 15L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="13" cy="6" r="1.5" fill="currentColor"/>
                      </svg>
                      <span className="font-semibold">Digital Signatures</span>
                    </NavLink>
                  </li>
                  
                </ul>
              </div>

              {/* ========================================== */}
              {/* 🔐 GRUPO 4: AUTHENTICATION */}
              {/* Registro y autenticación */}
              {/* ========================================== */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#07373a' }}>
                  🔐 AUTHENTICATION
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  
                  {/* 📝 MENU ITEM: Sign Up - Registro de usuarios */}
                  <li>
                    <NavLink
                      to="/auth/signup"
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg py-3 px-4 font-medium transition-all duration-300 ease-in-out hover:shadow-lg ${
                          isActive ? 'bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg' : ''
                        }`
                      }
                      style={({ isActive }) => ({
                        color: '#07373a',
                        fontWeight: isActive ? 600 : 500,
                      })}
                    >
                      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="6" r="4" fill="" opacity="0.5"/>
                        <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18H3Z" fill="currentColor"/>
                        <circle cx="15" cy="15" r="3" fill="white"/>
                        <path d="M15 13V17M13 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="font-semibold">Sign Up</span>
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
