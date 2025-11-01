import type { Role } from "./Role";
import type { Permission } from "./Permission";

/**
 * RolePermission - Tabla intermedia para la relación N:N entre Role y Permission
 * Representa qué permisos tiene asignado cada rol
 */
export interface RolePermission {
    id?: string;              // UUID string (backend genera automáticamente)
    role_id?: number;         // Foreign key a roles.id
    permission_id?: number;   // Foreign key a permissions.id
    created_at?: Date | string;
    updated_at?: Date | string;
    
    // Relaciones opcionales (cuando la API las devuelva embebidas)
    role?: Role;              // Rol asociado
    permission?: Permission;  // Permiso asociado
}

export default RolePermission;