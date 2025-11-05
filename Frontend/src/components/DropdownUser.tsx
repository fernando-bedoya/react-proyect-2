import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import SecurityService from '../services/securityService';
import sessionService from '../services/sessionService';
import uploadService from '../services/uploadService';
import { useTheme } from '../context/ThemeContext';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const { designLibrary } = useTheme();
  
  // Esto lee la base de datos global del store Redux para obtener el usuario logueado
  const user = useSelector((state: RootState) => state.user.user);
  
  /**
   * Función para manejar el cierre de sesión del usuario
   * 
   * FLUJO DE LOGOUT:
   * 1. Llama a SecurityService.logout() que:
   *    - Limpia el token de localStorage (key: 'access_token')
   *    - Limpia el refresh_token de localStorage (key: 'refresh_token')
   *    - Limpia los datos del usuario de localStorage (key: 'user')
   *    - Actualiza Redux con setUser(null) para limpiar el estado global
   *    - Emite evento 'userChange' para notificar a otros componentes
   * 2. Cierra el dropdown del usuario
   * 3. Muestra logs en consola para debugging
   * 4. Redirige al usuario a la página de login (/auth/signin)
   * 
   * NOTA: Este logout es solo del frontend, no hace petición al backend
   * porque el token JWT es stateless (el backend no mantiene sesiones)
   */
  const handleLogout = () => {
    console.log('🚪 Iniciando proceso de logout...');
    console.log('   Usuario actual:', user?.name, '(' + user?.email + ')');
    
    // Paso 1: Intentar notificar al backend para revocar/eliminar la sesión
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        console.log('No se encontró session_id en localStorage. No se intentará modificar sesión en backend.');
      } else {
        // Validación básica del formato UUID antes de intentar modificar
        const uuidLike = /^[0-9a-fA-F\-]{36,}$/;
        if (!uuidLike.test(sessionId)) {
          console.warn('session_id presente pero no tiene formato UUID esperado. Se omitirá la operación en el backend.', sessionId);
        } else {
          // En lugar de eliminar la sesión, la marcamos como 'revoked' para mantener historial
          sessionService.updateSession(sessionId, { state: 'revoked' }).then((updated) => {
            if (updated) console.log('🔒 Sesión marcada como revocada en backend:', sessionId);
            else console.warn('⚠ No se pudo marcar la sesión como revocada en backend:', sessionId);
          }).catch(err => console.warn('Error al actualizar sesión en backend:', err));
        }
      }
    } catch (err) {
      console.warn('Error al intentar eliminar sesión en backend:', err);
    }

    // Paso 2: Llamar al servicio de seguridad para limpiar todo localmente
    SecurityService.logout();
    
    // Paso 2: Cerrar el dropdown
    setDropdownOpen(false);
    
    console.log('✅ Logout completado');
    console.log('   - Token eliminado de localStorage');
    console.log('   - Usuario eliminado de Redux');
    console.log('   - Redirigiendo al login...');
    
    // Paso 3: Redirigir al login
    navigate('/auth/signin');
  };
  
  /**
   * Función para generar las iniciales del usuario desde su nombre
   * Toma las primeras letras de las dos primeras palabras del nombre
   * Ejemplo: "Juan Pérez" → "JP", "María" → "M"
   */
  const getInitials = (name?: string): string => {
    if (!name) return 'U'; // U de User por defecto
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  };

  /**
   * Función para generar un color de fondo único basado en el nombre del usuario
   * Usa un algoritmo de hash simple para convertir el nombre en un color consistente
   * El mismo nombre siempre generará el mismo color
   */
  const getAvatarColor = (name?: string): string => {
    if (!name) return '#10b981'; // Verde por defecto
    
    // Paleta de colores profesionales y accesibles
    const colors = [
      '#10b981', // Verde esmeralda
      '#3b82f6', // Azul
      '#8b5cf6', // Púrpura
      '#ec4899', // Rosa
      '#f59e0b', // Ámbar
      '#ef4444', // Rojo
      '#06b6d4', // Cyan
      '#6366f1', // Índigo
    ];
    
    // Algoritmo de hash simple: suma los códigos ASCII de cada carácter
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    
    // Usa el módulo del hash para seleccionar un color de la paleta
    return colors[hash % colors.length];
  };

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // Cargar foto de perfil del usuario
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (user?.id) {
        try {
          const profile = await uploadService.getProfileByUserId(user.id);
          if (profile?.photo) {
            const photoUrl = uploadService.getImageUrl(profile.photo, 'profile');
            setProfilePhoto(photoUrl);
          }
        } catch (error) {
          console.log('Usuario sin foto de perfil');
        }
      }
    };
    
    loadProfilePhoto();
  }, [user]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className={designLibrary === 'bootstrap' ? 'position-relative' : 'relative'}>
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={designLibrary === 'bootstrap' ? 'd-flex align-items-center gap-3 text-decoration-none' : 'flex items-center gap-4'}
        to="#"
      >
        {/* ✅ Información del usuario: nombre y email (oculta en móvil, visible en desktop) */}
        <span className={designLibrary === 'bootstrap' ? 'd-none d-lg-block text-end' : 'hidden text-right lg:block'}>
          <span className={designLibrary === 'bootstrap' ? 'd-block text-dark fw-medium' : 'block text-sm font-medium text-black dark:text-white'} style={{ fontSize: designLibrary === 'bootstrap' ? '0.875rem' : undefined }}>
            {user ? user.name : 'Guest'}
          </span>
          <span className={designLibrary === 'bootstrap' ? 'd-block text-muted' : 'block text-xs text-gray-500 dark:text-gray-400'} style={{ fontSize: designLibrary === 'bootstrap' ? '0.75rem' : undefined }}>
            {user ? user.email : 'guest@example.com'}
          </span>
        </span>

        {/* ✅ Avatar del usuario con foto o iniciales */}
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={user?.name || 'Usuario'}
            className={designLibrary === 'bootstrap' ? 'rounded-circle' : 'h-12 w-12 rounded-full'}
            style={{ 
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              ...(designLibrary === 'bootstrap' && {
                width: '48px',
                height: '48px'
              })
            }}
            title={user?.name || 'Usuario'}
          />
        ) : (
          <span 
            className={designLibrary === 'bootstrap' ? 'rounded-circle d-flex align-items-center justify-content-center text-white fw-bold' : 'h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg'}
            style={{ 
              backgroundColor: getAvatarColor(user?.name),
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              ...(designLibrary === 'bootstrap' && {
                width: '48px',
                height: '48px',
                fontSize: '1.125rem'
              })
            }}
            title={user?.name || 'Usuario'}
          >
            {getInitials(user?.name)}
          </span>
        )}

        {/* ✅ Icono de flecha (chevron) - indicador de dropdown */}
        <svg
          className={designLibrary === 'bootstrap' 
            ? `d-none d-sm-block ${dropdownOpen ? 'rotate-180' : ''}` 
            : `hidden fill-current sm:block ${dropdownOpen ? 'rotate-180' : ''}`
          }
          style={{
            transition: 'transform 0.3s ease',
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? 'block' : 'hidden'
        }`}
      >
        {/* Sección de información del usuario - Muestra avatar grande, nombre y email */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
          {/* Avatar grande con foto o iniciales */}
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={user?.name || 'Usuario'}
              className="h-16 w-16 rounded-full flex-shrink-0"
              style={{ 
                objectFit: 'cover',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
              }}
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ 
                backgroundColor: getAvatarColor(user?.name),
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
              }}
            >
              {getInitials(user?.name)}
            </div>
          )}
          
          {/* Información del usuario: nombre completo y email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black dark:text-white truncate" title={user?.name || 'Guest'}>
              {user?.name || 'Guest'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user?.email || 'guest@example.com'}>
              {user?.email || 'guest@example.com'}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          <li>
            <Link
              to={user?.id ? `/profile/${user.id}` : '/profile'}
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z"
                  fill=""
                />
                <path
                  d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z"
                  fill=""
                />
              </svg>
              My Profile
            </Link>
          </li>
        </ul>
        {/* 
          Botón de Logout - Cerrar sesión del usuario
          
          Al hacer click:
          1. Limpia todos los tokens y datos del usuario del localStorage
          2. Actualiza Redux eliminando el usuario del estado global
          3. Redirige automáticamente a la página de login
          
          IMPORTANTE: Este componente reutiliza el SecurityService para
          mantener consistencia en el manejo de autenticación en toda la app
        */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3.5 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 lg:text-base transition-all"
          title="Cerrar sesión"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
              fill=""
            />
            <path
              d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
              fill=""
            />
          </svg>
          Log Out
        </button>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;