import type { User } from "./User";
import type { UserRole } from "./UserRole";
import type { RolePermission } from "./RolePermission";

/**
 * Role - Define un rol en el sistema con sus permisos asociados
 */
export interface Role {
    id?: number;
    name?: string;
    description?: string;
    created_at?: Date | string;
    updated_at?: Date | string;
    
    // Relaciones N:N con User (usuarios que tienen este rol)
    users?: User[];
    user_roles?: UserRole[];
    
    // Relaciones N:N con Permission (permisos que tiene este rol)
    role_permissions?: RolePermission[];
}

export default Role;
