// api.js - Configuración de la instancia de Axios para comunicación con el backend
// Este archivo configura Axios con interceptores para manejar autenticación OAuth automáticamente
// Sirve para centralizar la configuración HTTP y gestionar tokens en todas las peticiones al backend

import axios from 'axios';

// Configuración de la URL base del backend
const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
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
    }
    
    // Si los datos son FormData, eliminar Content-Type para que Axios lo configure automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📎 Enviando FormData con archivos');
    }
    
    // Log para debug (opcional, puedes comentar en producción)
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    
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
    // Log para debug (opcional, puedes comentar en producción)
    console.log('📥 Response:', response.status, response.config.url);
    
    return response;
  },
  (error) => {
    // Manejar errores en la respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('❌ Response Error:', error.response.status, error.response.data);
      
      // Si el token expiró o no es válido (401), redirigir al login
      if (error.response.status === 401) {
        console.warn('⚠️ Token inválido o expirado. Redirigiendo al login...');
        
        // Limpiar el token del localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirigir al login (puedes ajustar la ruta según tu aplicación)
        window.location.href = '/login';
      }
      
      // Si hay un error de permisos (403)
      if (error.response.status === 403) {
        console.warn('⚠️ No tienes permisos para acceder a este recurso.');
      }
    } else if (error.request) {
      // La petición se realizó pero no se recibió respuesta
      console.error('❌ Network Error:', error.message);
    } else {
      // Algo sucedió al configurar la petición
      console.error('❌ Error:', error.message);
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
