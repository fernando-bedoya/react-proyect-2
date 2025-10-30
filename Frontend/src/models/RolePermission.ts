export interface RolePermission {
    id?: string; // UUID string as in backend
    role_id?: number;
    permission_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export default RolePermission;