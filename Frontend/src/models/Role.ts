import type { User } from "./User";
import type { UserRole } from "./UserRole";

export interface Role {
    id?: number;
    name?: string;
    description?: string;
    // Usuarios asociados (cuando la API los devuelva embebidos)
    users?: User[];
    // Relaciones intermedias (opcional)
    userRoles?: UserRole[];
}
//aqui se pueden escribir metodos, aqui se tiran las cardinalidades de las relaciones
//ejemplo si un usuario tiene muchos posts, se puede hacer un metodo que traiga los posts de ese usuario
//pero en este caso no hay relaciones, asi que no hay metodos
