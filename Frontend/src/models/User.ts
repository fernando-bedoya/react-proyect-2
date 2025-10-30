import { Session } from "./Session";
import { Address } from "./Address";
import { Password } from "./Password";
import { Role } from "./Role";
import { UserRole } from "./UserRole";

export interface User {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
    // Relación 1:1 con Address
    // - `addressId` es el identificador FK opcional (útil si la API devuelve solo el id)
    // - `address` es el objeto embebido (útil si la API devuelve la dirección junto al usuario)
    addressId?: number;
    address?: Address;
    // Relación 1:n con Password: un usuario puede tener múltiples contraseñas
    // - `passwords` contiene las contraseñas asociadas cuando la API las devuelve embebidas
    passwords?: Password[];
    // Relación n:n con Role mediante UserRole
    // - `roles` es la lista de roles cuando la API devuelve los roles embebidos
    // - `userRoles` es la lista de relaciones intermedias (puede contener metadatos como `startAt`/`endAt`)
    roles?: Role[];
    userRoles?: UserRole[];
}

// Aquí puedes añadir métodos o utilidades relacionadas con User si lo deseas.
// La relación 1:1 se representa por `addressId` y/o por el objeto `address`.