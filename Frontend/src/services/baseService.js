// baseService.js - Servicio genérico con funciones CRUD reutilizables
// Este archivo proporciona funciones base para operaciones Create, Read, Update, Delete en cualquier recurso
// Sirve para evitar duplicar código de peticiones HTTP y estandarizar las operaciones con el backend

import axiosInstance from './axiosInterceptor';

/**
 * Servicio base genérico para operaciones CRUD
 * Utiliza la instancia de Axios configurada en axiosInstance.js
 */

/**
 * Obtiene todos los registros de un recurso
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {object} params - Parámetros de consulta opcionales (ej: { page: 1, limit: 10 })
 * @returns {Promise} - Promesa con los datos de la respuesta
 * @example
 * const users = await getAll('users', { page: 1, limit: 10 });
 */
export const getAll = async (resource, params = {}) => {
  try {
    const response = await axiosInstance.get(`/${resource}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener todos los registros de ${resource}:`, error);
    throw error;
  }
};

/**
 * Obtiene un registro específico por su ID
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {string|number} id - ID del registro a obtener
 * @returns {Promise} - Promesa con los datos del registro
 * @example
 * const user = await getById('users', 123);
 */
export const getById = async (resource, id) => {
  try {
    const response = await axiosInstance.get(`/${resource}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el registro ${id} de ${resource}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo registro
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {object} data - Datos del nuevo registro
 * @returns {Promise} - Promesa con los datos del registro creado
 * @example
 * const newUser = await create('users', { name: 'John Doe', email: 'john@example.com' });
 */
export const create = async (resource, data) => {
  try {
    const response = await axiosInstance.post(`/${resource}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al crear registro en ${resource}:`, error);
    throw error;
  }
};

/**
 * Actualiza un registro existente
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {string|number} id - ID del registro a actualizar
 * @param {object} data - Datos a actualizar
 * @returns {Promise} - Promesa con los datos del registro actualizado
 * @example
 * const updatedUser = await update('users', 123, { name: 'Jane Doe' });
 */
export const update = async (resource, id, data) => {
  try {
    const response = await axiosInstance.put(`/${resource}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el registro ${id} de ${resource}:`, error);
    throw error;
  }
};

/**
 * Actualiza parcialmente un registro existente
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {string|number} id - ID del registro a actualizar
 * @param {object} data - Datos a actualizar parcialmente
 * @returns {Promise} - Promesa con los datos del registro actualizado
 * @example
 * const patchedUser = await patch('users', 123, { email: 'newemail@example.com' });
 */
export const patch = async (resource, id, data) => {
  try {
    const response = await axiosInstance.patch(`/${resource}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar parcialmente el registro ${id} de ${resource}:`, error);
    throw error;
  }
};

/**
 * Elimina un registro
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {string|number} id - ID del registro a eliminar
 * @returns {Promise} - Promesa con la respuesta de la eliminación
 * @example
 * await remove('users', 123);
 */
export const remove = async (resource, id) => {
  try {
    const response = await axiosInstance.delete(`/${resource}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el registro ${id} de ${resource}:`, error);
    throw error;
  }
};

/**
 * Realiza una búsqueda en el recurso
 * @param {string} resource - Nombre del recurso (ej: "users", "roles", "permissions")
 * @param {string} query - Término de búsqueda
 * @param {object} additionalParams - Parámetros adicionales opcionales
 * @returns {Promise} - Promesa con los resultados de la búsqueda
 * @example
 * const results = await search('users', 'john', { limit: 5 });
 */
export const search = async (resource, query, additionalParams = {}) => {
  try {
    const response = await axiosInstance.get(`/${resource}/search`, {
      params: { q: query, ...additionalParams },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al buscar en ${resource}:`, error);
    throw error;
  }
};

/**
 * Objeto que agrupa todas las operaciones CRUD
 * Útil para importación destructurada
 */
const baseService = {
  getAll,
  getById,
  create,
  update,
  patch,
  remove,
  search,
};

export default baseService;
