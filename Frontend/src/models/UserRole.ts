import type { User } from "./User";
import type { Role } from "./Role";

export interface UserRole {
    id?: number;
    starAt?: Date;
    endAt?: Date;
    // FK a User y Role
    userId?: number;
    roleId?: number;
    // Referencias opcionales al objeto completo (si la API las devuelve embebidas)
    user?: User;
    role?: Role;
}
//aqui se pueden escribir metodos, aqui se tiran las cardinalidades de las relaciones
//ejemplo si un usuario tiene muchos posts, se puede hacer un metodo que traiga los posts de ese usuario
//pero en este caso no hay relaciones, asi que no hay metodos