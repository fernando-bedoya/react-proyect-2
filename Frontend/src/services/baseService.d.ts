/**
 * Type definitions for baseService.js
 * Provides TypeScript support for generic CRUD operations
 */

export interface QueryParams {
  [key: string]: any;
}

/**
 * Gets all records from a resource
 */
export function getAll(resource: string, params?: QueryParams): Promise<any>;

/**
 * Gets a specific record by ID
 */
export function getById(resource: string, id: string | number): Promise<any>;

/**
 * Creates a new record
 */
export function create(resource: string, data: any): Promise<any>;

/**
 * Updates an existing record
 */
export function update(resource: string, id: string | number, data: any): Promise<any>;

/**
 * Partially updates an existing record
 */
export function patch(resource: string, id: string | number, data: any): Promise<any>;

/**
 * Deletes a record
 */
export function remove(resource: string, id: string | number): Promise<any>;

/**
 * Searches within a resource
 */
export function search(resource: string, query: string, additionalParams?: QueryParams): Promise<any>;

/**
 * Base service object with all CRUD operations
 */
declare const baseService: {
  getAll: typeof getAll;
  getById: typeof getById;
  create: typeof create;
  update: typeof update;
  patch: typeof patch;
  remove: typeof remove;
  search: typeof search;
};

export default baseService;
