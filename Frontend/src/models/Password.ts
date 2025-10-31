
export interface Password {
    id: number;
    content: string;
    starAt: Date;
    endAT: Date;
    // FK opcional apuntando al usuario dueño de esta contraseña
    userId?: number;
}