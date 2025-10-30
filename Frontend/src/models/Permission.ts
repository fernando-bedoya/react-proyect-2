export interface Permission {
    id?: number;
    url?: string;
    method?: string;
    entity?: string;
    created_at?: Date;
    updated_at?: Date;
}

export default Permission;