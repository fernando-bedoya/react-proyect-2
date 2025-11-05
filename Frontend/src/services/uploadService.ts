import axios from "axios";

/**
 * UploadService - Servicio genérico para manejar la carga de archivos al backend
 * 
 * Este servicio proporciona funcionalidad reutilizable para:
 * 1. Subir imágenes de perfil a /profiles
 * 2. Subir firmas digitales a /digital-signatures
 * 3. Cualquier otra necesidad de carga de archivos en el futuro
 * 
 * El backend Flask ya está configurado para recibir archivos con FormData
 * y los guarda automáticamente en:
 * - Backend/app/static/uploads/profiles (fotos de perfil)
 * - Backend/app/static/uploads/digital-signatures (firmas digitales)
 */

// URL base del API desde variable de entorno
const API_URL = (import.meta as any).env?.VITE_API_URL || "";

/**
 * Interfaz para la respuesta de carga de imagen
 * El backend retorna la URL de la imagen guardada
 */
interface UploadResponse {
  photo?: string;        // URL de la imagen subida (para perfiles)
  signature?: string;    // URL de la firma subida (para firmas digitales)
  [key: string]: any;    // Otros campos que pueda retornar el backend
}

class UploadService {
  /**
   * Crea un objeto FormData para enviar archivos al backend
   * FormData es necesario para enviar archivos en peticiones HTTP
   * 
   * @param file - Archivo a subir (File object del input)
   * @param additionalData - Datos adicionales opcionales para enviar junto con el archivo
   * @returns FormData listo para enviar
   */
  private createFormData(file: File, additionalData?: Record<string, any>): FormData {
    const formData = new FormData();
    
    // Añadir el archivo con la clave 'photo' (el backend espera este nombre)
    formData.append('photo', file);
    
    // Añadir cualquier dato adicional que se pase (nombre, descripción, etc.)
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    return formData;
  }

  /**
   * Sube una foto de perfil al backend
   * 
   * El backend espera:
   * - POST /api/profiles/user/{user_id} para crear nuevo perfil
   * - PUT /api/profiles/{profile_id} para actualizar perfil existente
   * 
   * @param userId - ID del usuario
   * @param file - Archivo de imagen a subir
   * @param profileId - ID del perfil (opcional, si existe se actualiza, sino se crea)
   * @param additionalData - Datos adicionales del perfil (nombre, bio, etc.)
   * @returns Respuesta del backend con la URL de la imagen guardada
   */
  async uploadProfilePhoto(
    userId: number,
    file: File,
    profileId?: number,
    additionalData?: Record<string, any>
  ): Promise<UploadResponse> {
    try {
      // Crear FormData con el archivo y datos adicionales
      const formData = this.createFormData(file, additionalData);
      
      let response;
      
      if (profileId) {
        // Si existe profileId, actualizar perfil existente (PUT)
        response = await axios.put<UploadResponse>(
          `${API_URL}/profiles/${profileId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data', // Importante para enviar archivos
            },
          }
        );
      } else {
        // Si no existe profileId, crear nuevo perfil (POST)
        response = await axios.post<UploadResponse>(
          `${API_URL}/profiles/user/${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
      
      return response.data;
    } catch (error) {
      console.error("Error al subir foto de perfil:", error);
      throw error;
    }
  }

  /**
   * Sube una firma digital al backend
   * 
   * El backend espera:
   * - POST /api/digital-signatures/user/{user_id} para crear nueva firma
   * - PUT /api/digital-signatures/{signature_id} para actualizar firma existente
   * 
   * @param userId - ID del usuario
   * @param file - Archivo de imagen de la firma
   * @param signatureId - ID de la firma (opcional, si existe se actualiza, sino se crea)
   * @returns Respuesta del backend con la URL de la firma guardada
   */
  async uploadDigitalSignature(
    userId: number,
    file: File,
    signatureId?: number
  ): Promise<UploadResponse> {
    try {
      // Crear FormData solo con el archivo (firmas no tienen datos adicionales)
      const formData = this.createFormData(file);
      
      let response;
      
      if (signatureId) {
        // Si existe signatureId, actualizar firma existente (PUT)
        response = await axios.put<UploadResponse>(
          `${API_URL}/digital-signatures/${signatureId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Si no existe signatureId, crear nueva firma (POST)
        response = await axios.post<UploadResponse>(
          `${API_URL}/digital-signatures/user/${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
      
      return response.data;
    } catch (error) {
      console.error("Error al subir firma digital:", error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario
   * @param userId - ID del usuario
   * @returns Perfil del usuario o null si no existe
   */
  async getProfileByUserId(userId: number): Promise<any | null> {
    try {
      const response = await axios.get(`${API_URL}/profiles/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // Si retorna 404, el usuario no tiene perfil aún
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error al obtener perfil:", error);
      throw error;
    }
  }

  /**
   * Obtiene la firma digital de un usuario
   * @param userId - ID del usuario
   * @returns Firma digital del usuario o null si no existe
   */
  async getDigitalSignatureByUserId(userId: number): Promise<any | null> {
    try {
      const response = await axios.get(`${API_URL}/digital-signatures/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // Si retorna 404, el usuario no tiene firma aún
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error al obtener firma digital:", error);
      throw error;
    }
  }

  /**
   * Construye la URL completa de una imagen
   * El backend sirve las imágenes desde /api/profiles/{filename} o /api/digital-signatures/{filename}
   * 
   * IMPORTANTE: El backend guarda la ruta completa en la BD (ej: "profiles/uuid_file.png")
   * pero el endpoint solo espera el nombre del archivo (ej: "uuid_file.png")
   * por lo tanto debemos extraer solo el nombre del archivo de la ruta.
   * 
   * @param filename - Ruta del archivo retornado por el backend (ej: "profiles/uuid_file.png")
   * @param type - Tipo de imagen: 'profile' o 'signature'
   * @returns URL completa de la imagen para mostrar en el frontend
   */
  getImageUrl(filename: string, type: 'profile' | 'signature'): string {
    if (!filename) return '';
    
    // Si el filename ya es una URL completa, retornarla tal cual
    if (filename.startsWith('http')) {
      return filename;
    }
    
    // Extraer solo el nombre del archivo de la ruta completa
    // Ej: "profiles/uuid_filename.png" → "uuid_filename.png"
    // Ej: "digital-signatures/uuid_file.png" → "uuid_file.png"
    const actualFilename = filename.split('/').pop() || filename;
    
    // Construir URL según el tipo de imagen
    // profiles → /api/profiles/{filename}
    // signature → /api/digital-signatures/{filename}
    const endpoint = type === 'profile' ? 'profiles' : 'digital-signatures';
    return `${API_URL}/${endpoint}/${actualFilename}`;
  }
}

// Exportar instancia única del servicio para reutilizar en toda la app
export const uploadService = new UploadService();
export default uploadService;
