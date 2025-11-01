/**
 * UserProfile.tsx
 * 
 * Componente de perfil de usuario que muestra la información del usuario logueado
 * y permite editarla en un modal. Reutiliza GenericModal y GenericForm al máximo.
 * 
 * Características:
 * - Muestra nombre, email, teléfono y avatar con iniciales
 * - Permite editar la información en un modal
 * - Usa Redux para obtener el usuario actual
 * - Totalmente responsive y con 3 temas (Bootstrap, Tailwind, Material)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setUser } from '../../store/userSlice';
import { User as UserIcon, Mail, Phone, Edit, ArrowLeft } from 'lucide-react';
import GenericModal from '../../components/GenericModal';
import GenericForm from '../../components/GenericForm';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';

/**
 * Genera las iniciales del nombre del usuario
 * Ejemplo: "Juan Pérez" → "JP"
 */
const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
};

/**
 * Genera un color único para el avatar basado en el nombre
 * El mismo nombre siempre genera el mismo color
 */
const getAvatarColor = (name?: string): string => {
  if (!name) return '#10b981';
  
  const colors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
    '#f59e0b', '#ef4444', '#06b6d4', '#6366f1',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  
  return colors[hash % colors.length];
};

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID del usuario desde la URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { designLibrary } = useTheme();
  
  // Obtener usuario actual de Redux
  const currentUser = useSelector((state: RootState) => state.user.user);
  
  // Estado local
  const [user, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  
  /**
   * Cargar datos del usuario al montar el componente
   * Si hay ID en la URL, carga ese usuario, sino usa el usuario logueado
   */
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        if (id) {
          // Cargar usuario específico por ID
          const userData = await userService.getUserById(parseInt(id));
          setUserData(userData);
        } else {
          // Usar usuario actual de Redux
          setUserData(currentUser);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [id, currentUser]);
  
  /**
   * Maneja la actualización del perfil
   * Actualiza el usuario en el backend y en Redux
   */
  const handleUpdateProfile = async (values: any) => {
    try {
      // Actualizar en el backend
      const updatedUser = await userService.updateUser(user.id, values);
      
      // Actualizar estado local
      setUserData(updatedUser);
      
      // Si es el usuario actual, actualizar Redux también
      if (currentUser?.id === user.id) {
        dispatch(setUser(updatedUser));
      }
      
      setShowEditModal(false);
      
      Swal.fire({
        title: '¡Actualizado!',
        text: 'Perfil actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay usuario
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Usuario no encontrado</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  
  // Campos del formulario de edición
  const formFields = [
    { 
      name: 'name', 
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingresa tu nombre completo',
      helpText: 'Tu nombre será visible en tu perfil'
    },
    { 
      name: 'email', 
      label: 'Correo Electrónico',
      type: 'email' as const,
      required: true,
      placeholder: 'tu@email.com',
      helpText: 'Usaremos este email para contactarte'
    },
    { 
      name: 'phone', 
      label: 'Teléfono',
      type: 'tel' as const,
      placeholder: '+57 123 456 7890',
      helpText: 'Opcional: Tu número de contacto'
    }
  ];
  
  // Colores según el tema
  const themeColors = {
    bootstrap: {
      bg: 'bg-gradient-to-br from-emerald-50 to-green-100',
      card: 'bg-white border-4 border-emerald-500 shadow-2xl',
      button: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
      text: 'text-emerald-900',
      icon: 'text-emerald-600'
    },
    tailwind: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      card: 'bg-white border-4 border-amber-500 shadow-2xl',
      button: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700',
      text: 'text-amber-900',
      icon: 'text-amber-600'
    },
    material: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      card: 'bg-white border-4 border-blue-500 shadow-2xl',
      button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    }
  };
  
  const colors = themeColors[designLibrary];
  
  return (
    <div className={`min-h-screen ${colors.bg} py-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Botón de regresar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </button>
        
        {/* Card principal del perfil */}
        <div className={`${colors.card} rounded-3xl overflow-hidden`}>
          {/* Header con avatar grande */}
          <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black p-12 text-center relative">
            {/* Avatar con iniciales */}
            <div 
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-bold shadow-2xl"
              style={{ 
                backgroundColor: getAvatarColor(user.name),
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
              }}
            >
              {getInitials(user.name)}
            </div>
            
            {/* Nombre del usuario */}
            <h1 className="text-3xl font-bold text-white mt-6 mb-2">
              {user.name || 'Usuario'}
            </h1>
            
            {/* Email del usuario */}
            <p className="text-gray-300 text-lg">
              {user.email || 'email@ejemplo.com'}
            </p>
            
            {/* Botón de editar (floating) */}
            <button
              onClick={() => setShowEditModal(true)}
              className={`absolute top-6 right-6 ${colors.button} text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg`}
            >
              <Edit size={18} />
              <span>Editar Perfil</span>
            </button>
          </div>
          
          {/* Información detallada */}
          <div className="p-12">
            <h2 className={`text-2xl font-bold ${colors.text} mb-8`}>
              Información del Perfil
            </h2>
            
            <div className="space-y-6">
              {/* Nombre */}
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className={`${colors.icon} mt-1`}>
                  <UserIcon size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Nombre Completo
                  </p>
                  <p className={`text-lg font-semibold ${colors.text} dark:text-white`}>
                    {user.name || 'No especificado'}
                  </p>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className={`${colors.icon} mt-1`}>
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Correo Electrónico
                  </p>
                  <p className={`text-lg font-semibold ${colors.text} dark:text-white`}>
                    {user.email || 'No especificado'}
                  </p>
                </div>
              </div>
              
              {/* Teléfono */}
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className={`${colors.icon} mt-1`}>
                  <Phone size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Teléfono
                  </p>
                  <p className={`text-lg font-semibold ${colors.text} dark:text-white`}>
                    {user.phone || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de edición - Reutiliza GenericModal y GenericForm */}
      <GenericModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Editar Perfil"
        size="lg"
        centered
      >
        <GenericForm
          fields={formFields}
          initialData={{
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          }}
          onSubmit={handleUpdateProfile}
          submitLabel="Guardar Cambios"
          cancelLabel="Cancelar"
          onCancel={() => setShowEditModal(false)}
        />
      </GenericModal>
    </div>
  );
};

export default UserProfile;
