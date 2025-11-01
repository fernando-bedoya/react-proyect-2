// api.js - Configuración de la instancia de Axios para comunicación con el backend
// Este archivo configura Axios con interceptores para manejar autenticación OAuth automáticamente
// Sirve para centralizar la configuración HTTP y gestionar tokens en todas las peticiones al backend

import axios from 'axios';

// Configuración de la URL base del backend
const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de Axios con configuraciones para asegurar que los headers sean visibles
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANTE: Estas configuraciones ayudan a que los headers sean visibles en DevTools
  // - withCredentials: Permite enviar cookies y headers de autenticación
  // - validateStatus: Acepta cualquier código de estado para evitar cancelaciones
  withCredentials: false, // false para CORS simple (si backend no usa cookies)
  validateStatus: function (status) {
    // Aceptar cualquier código de estado para evitar que Axios cancele la petición
    // Esto hace que los headers sean siempre visibles en DevTools Network
    return status >= 200 && status < 600; // Acepta todos los códigos
  },
});

// Interceptor de peticiones - Agrega el token OAuth a cada petición
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Agregar el token en el header Authorization
      config.headers.Authorization = `Bearer ${token}`;
      
      // 🔍 LOG MEJORADO: Mostrar el token completo en consola para debugging
      console.log('🔐 TOKEN BEARER ENVIADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Authorization Header:', `Bearer ${token}`);
      console.log('Token completo:', token);
      console.log('Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.warn('⚠️ NO HAY TOKEN: La petición se enviará sin autenticación');
    }
    
    // Si los datos son FormData, eliminar Content-Type para que Axios lo configure automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📎 Enviando FormData con archivos');
    }
    
    // Log para debug con más detalles
    console.log('📤 REQUEST DETAILS:');
    console.log('   Método:', config.method?.toUpperCase());
    console.log('   URL:', config.url);
    console.log('   Headers:', config.headers);
    console.log('   Data:', config.data);
    
    return config;
  },
  (error) => {
    // Manejar errores en la petición
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas - Maneja respuestas y errores globalmente
api.interceptors.response.use(
  (response) => {
    // 🔍 LOG MEJORADO: Mostrar detalles completos de la respuesta exitosa
    console.log('✅ RESPONSE EXITOSA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Status:', response.status, response.statusText);
    console.log('   URL:', response.config.url);
    console.log('   Data:', response.data);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return response;
  },
  (error) => {
    // Manejar errores en la respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('❌ RESPONSE ERROR:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('   Status:', error.response.status, error.response.statusText);
      console.error('   URL:', error.config?.url);
      console.error('   Data:', error.response.data);
      console.error('   Headers enviados:', error.config?.headers);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Si el token expiró o no es válido (401), redirigir al login
      if (error.response.status === 401) {
        console.warn('⚠️ AUTENTICACIÓN FALLIDA:');
        console.warn('   El token es inválido o ha expirado.');
        console.warn('   Token usado:', localStorage.getItem('access_token')?.substring(0, 50) + '...');
        console.warn('   Limpiando tokens y redirigiendo al login...');
        
        // Limpiar el token del localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirigir al login (puedes ajustar la ruta según tu aplicación)
        window.location.href = '/login';
      }
      
      // Si hay un error de permisos (403)
      if (error.response.status === 403) {
        console.warn('⚠️ PERMISO DENEGADO:');
        console.warn('   No tienes permisos para acceder a este recurso.');
        console.warn('   URL intentada:', error.config?.url);
      }
    } else if (error.request) {
      // La petición se realizó pero no se recibió respuesta
      console.error('❌ NETWORK ERROR:');
      console.error('   No se recibió respuesta del servidor');
      console.error('   Mensaje:', error.message);
    } else {
      // Algo sucedió al configurar la petición
      console.error('❌ ERROR:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Función auxiliar para actualizar el token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

// Función auxiliar para obtener el token actual
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Función auxiliar para limpiar la autenticación
export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Exportar la instancia configurada
export default api;
