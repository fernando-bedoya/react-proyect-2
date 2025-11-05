/**
 * RoleDetailView - Vista detallada de un rol específico
 * 
 * Este componente muestra toda la información de un rol en una vista de solo lectura.
 * Reutiliza el GenericModal para mantener consistencia con el resto de la aplicación.
 * 
 * Funcionalidades:
 * - Muestra ID, nombre y descripción del rol
 * - Botón para volver a la lista
 * - Botón para editar el rol (opcional)
 * - Manejo de errores si el rol no existe
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';

interface Role {
  id?: number;
  name?: string;
  description?: string;
}

const RoleDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtener ID del rol desde la URL
  const navigate = useNavigate();
  
  const [role, setRole] = useState<Role | null>(null); // Estado del rol
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  // Cargar datos del rol al montar el componente
  useEffect(() => {
    const loadRole = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError('ID de rol no proporcionado');
          return;
        }
        
        // Obtener rol desde el backend
        const data = await roleService.getRoleById(parseInt(id));
        
        if (!data) {
          setError('Rol no encontrado');
          return;
        }
        
        setRole(data);
      } catch (err) {
        console.error('Error al cargar rol:', err);
        setError('Error al cargar el rol. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [id]);

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del rol...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurre algún problema
  if (error || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error || 'Rol no encontrado'}</p>
          <button
            onClick={() => navigate('/roles/list')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  // Vista detallada del rol
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/roles/list')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Volver a la lista
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-4xl">🛡️</span>
          Detalles del Rol
        </h1>
      </div>

      {/* Card principal con la información del rol */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header del card con gradiente */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white">{role.name}</h2>
          <p className="text-blue-100 text-sm mt-1">ID: {role.id}</p>
        </div>

        {/* Contenido del card */}
        <div className="p-6 space-y-6">
          {/* Campo: ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🆔 ID del Rol
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 text-lg font-mono">{role.id}</p>
            </div>
          </div>

          {/* Campo: Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Nombre del Rol
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 text-lg">{role.name}</p>
            </div>
          </div>

          {/* Campo: Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Descripción
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[100px]">
              <p className="text-gray-800 whitespace-pre-wrap">
                {role.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => navigate('/roles/list')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
          <button
            onClick={() => navigate(`/permissions/list/${role.id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
            Ver Permisos
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailView;
