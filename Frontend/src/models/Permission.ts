import type { RolePermission } from "./RolePermission";

/**
 * Permission - Define un permiso de acceso a recursos del sistema
 * Combinación de url + method + entity define un permiso único
 */
export interface Permission {
    id?: number;
    url?: string;             // Ruta del endpoint (ej: /users, /roles)
    method?: string;          // Método HTTP (GET, POST, PUT, DELETE, etc.)
    entity?: string;          // Entidad relacionada (User, Role, Permission, etc.)
    created_at?: Date | string;
    updated_at?: Date | string;
    
    // Relaciones opcionales
    role_permissions?: RolePermission[];  // Roles que tienen este permiso
}

export default Permission;