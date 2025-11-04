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
import { User as UserIcon, Mail, Phone, Edit, ArrowLeft, Camera, FileSignature } from 'lucide-react';
import GenericModal from '../../components/GenericModal';
import GenericForm from '../../components/GenericForm';
import GenericImageUpload from '../../components/GenericImageUpload';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import uploadService from '../../services/uploadService';
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
  
  // Estados para manejo de imágenes (foto de perfil y firma digital)
  const [showPhotoModal, setShowPhotoModal] = useState(false); // Modal para subir foto de perfil
  const [showSignatureModal, setShowSignatureModal] = useState(false); // Modal para subir firma digital
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null); // Archivo de foto seleccionado
  const [selectedSignature, setSelectedSignature] = useState<File | null>(null); // Archivo de firma seleccionado
  const [uploading, setUploading] = useState(false); // Estado de carga durante upload
  const [profile, setProfile] = useState<any>(null); // Datos del perfil (con foto)
  const [signature, setSignature] = useState<any>(null); // Datos de la firma digital
  
  /**
   * Cargar datos del usuario, perfil (foto) y firma digital al montar el componente
   * Si hay ID en la URL, carga ese usuario, sino usa el usuario logueado
   */
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        let userData;
        if (id) {
          // Cargar usuario específico por ID
          userData = await userService.getUserById(parseInt(id));
        } else {
          // Usar usuario actual de Redux
          userData = currentUser;
        }
        
        setUserData(userData);
        
        // Cargar perfil (foto) si existe
        if (userData?.id) {
          try {
            const profileData = await uploadService.getProfileByUserId(userData.id);
            setProfile(profileData);
          } catch (error) {
            console.log('Usuario sin foto de perfil');
          }
          
          // Cargar firma digital si existe
          try {
            const signatureData = await uploadService.getDigitalSignatureByUserId(userData.id);
            setSignature(signatureData);
          } catch (error) {
            console.log('Usuario sin firma digital');
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
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

  /**
   * Maneja la subida de foto de perfil
   * Usa el servicio uploadService para enviar la imagen al backend
   * El backend la guarda en Backend/app/static/uploads/profiles
   */
  const handleUploadPhoto = async () => {
    if (!selectedPhoto || !user?.id) {
      Swal.fire('Error', 'Por favor selecciona una foto primero', 'error');
      return;
    }

    setUploading(true);
    try {
      // Subir foto usando el servicio (crea o actualiza según si existe profile)
      const result = await uploadService.uploadProfilePhoto(
        user.id,
        selectedPhoto,
        profile?.id, // Si existe profile, se actualiza; si no, se crea
        { name: user.name } // Datos adicionales opcionales
      );

      // Actualizar estado con la nueva foto
      setProfile(result);
      setShowPhotoModal(false);
      setSelectedPhoto(null);

      Swal.fire({
        title: '¡Foto Actualizada!',
        text: 'Tu foto de perfil se actualizó correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error al subir foto:', error);
      Swal.fire(
        'Error',
        error.response?.data?.error || 'No se pudo subir la foto de perfil',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  /**
   * Maneja la subida de firma digital
   * Usa el servicio uploadService para enviar la firma al backend
   * El backend la guarda en Backend/app/static/uploads/digital-signatures
   */
  const handleUploadSignature = async () => {
    if (!selectedSignature || !user?.id) {
      Swal.fire('Error', 'Por favor selecciona una firma primero', 'error');
      return;
    }

    setUploading(true);
    try {
      // Subir firma usando el servicio (crea o actualiza según si existe signature)
      const result = await uploadService.uploadDigitalSignature(
        user.id,
        selectedSignature,
        signature?.id // Si existe signature, se actualiza; si no, se crea
      );

      // Actualizar estado con la nueva firma
      setSignature(result);
      setShowSignatureModal(false);
      setSelectedSignature(null);

      Swal.fire({
        title: '¡Firma Actualizada!',
        text: 'Tu firma digital se actualizó correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error al subir firma:', error);
      Swal.fire(
        'Error',
        error.response?.data?.error || 'No se pudo subir la firma digital',
        'error'
      );
    } finally {
      setUploading(false);
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
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      card: 'bg-white border-4 border-blue-500 shadow-2xl',
      button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    },
    material: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      card: 'bg-white border-4 border-amber-500 shadow-2xl',
      button: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700',
      text: 'text-amber-900',
      icon: 'text-amber-600'
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
            {/* Avatar con foto de perfil o iniciales */}
            {profile?.photo ? (
              // Si existe foto de perfil, mostrarla
              <img
                src={uploadService.getImageUrl(profile.photo, 'profile')}
                alt={user.name}
                className="w-32 h-32 rounded-full mx-auto shadow-2xl object-cover"
                style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}
              />
            ) : (
              // Si no existe foto, mostrar iniciales
              <div 
                className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-bold shadow-2xl"
                style={{ 
                  backgroundColor: getAvatarColor(user.name),
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
                }}
              >
                {getInitials(user.name)}
              </div>
            )}
            
            {/* Botón para cambiar foto (sobre el avatar) */}
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute top-[120px] left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="Cambiar foto de perfil"
            >
              <Camera size={20} />
            </button>
            
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

              {/* Firma Digital */}
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div className={`${colors.icon} mt-1`}>
                  <FileSignature size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Firma Digital
                  </p>
                  {signature?.photo ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={uploadService.getImageUrl(signature.photo, 'signature')}
                        alt="Firma digital"
                        className="h-16 border-2 border-gray-300 dark:border-gray-600 rounded-lg object-contain bg-white"
                      />
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className={`${colors.button} text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all`}
                      >
                        Cambiar Firma
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No has subido una firma digital
                      </p>
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className={`${colors.button} text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all`}
                      >
                        Subir Firma
                      </button>
                    </div>
                  )}
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

      {/* Modal para subir foto de perfil */}
      <GenericModal
        show={showPhotoModal}
        onHide={() => {
          setShowPhotoModal(false);
          setSelectedPhoto(null); // Limpiar selección al cerrar
        }}
        title="Actualizar Foto de Perfil"
        size="lg"
        centered
      >
        <div className="p-4">
          {/* Componente reutilizable GenericImageUpload para seleccionar imagen */}
          <GenericImageUpload
            onImageSelect={(file) => setSelectedPhoto(file)}
            currentImageUrl={profile?.photo ? uploadService.getImageUrl(profile.photo, 'profile') : undefined}
            label="Foto de Perfil"
            circularPreview={true} // Vista circular para fotos de perfil
            helpText="Selecciona una foto para tu perfil (JPG, PNG, GIF - máximo 5MB)"
            buttonText="Seleccionar Foto"
          />

          {/* Botones de acción con colores del tema activo */}
          <div className="d-flex gap-2 mt-4">
            <button
              onClick={handleUploadPhoto}
              disabled={!selectedPhoto || uploading}
              className={`flex-1 ${colors.button} text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Subiendo...
                </>
              ) : (
                'Guardar Foto'
              )}
            </button>
            <button
              onClick={() => {
                setShowPhotoModal(false);
                setSelectedPhoto(null);
              }}
              disabled={uploading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </GenericModal>

      {/* Modal para subir firma digital */}
      <GenericModal
        show={showSignatureModal}
        onHide={() => {
          setShowSignatureModal(false);
          setSelectedSignature(null); // Limpiar selección al cerrar
        }}
        title="Actualizar Firma Digital"
        size="lg"
        centered
      >
        <div className="p-4">
          {/* Componente reutilizable GenericImageUpload para seleccionar imagen */}
          <GenericImageUpload
            onImageSelect={(file) => setSelectedSignature(file)}
            currentImageUrl={signature?.photo ? uploadService.getImageUrl(signature.photo, 'signature') : undefined}
            label="Firma Digital"
            circularPreview={false} // Vista rectangular para firmas
            helpText="Selecciona una imagen de tu firma digital (JPG, PNG, GIF - máximo 5MB)"
            buttonText="Seleccionar Firma"
          />

          {/* Botones de acción con colores del tema activo */}
          <div className="d-flex gap-2 mt-4">
            <button
              onClick={handleUploadSignature}
              disabled={!selectedSignature || uploading}
              className={`flex-1 ${colors.button} text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Subiendo...
                </>
              ) : (
                'Guardar Firma'
              )}
            </button>
            <button
              onClick={() => {
                setShowSignatureModal(false);
                setSelectedSignature(null);
              }}
              disabled={uploading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </GenericModal>
    </div>
  );
};

export default UserProfile;
