import axios from "axios";
import { Role } from "../models/Role";

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_URL = VITE_API_URL + "/roles";

class RoleService {
    async getRoles(): Promise<Role[]> {
        try {
            const response = await axios.get<Role[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener roles:", error);
            throw error;
        }
    }

    async getRoleById(id: number): Promise<Role | null> {
        try {
            const response = await axios.get<Role>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Role no encontrado:", error);
            return null;
        }
    }

    async createRole(role: Omit<Role, "id">): Promise<Role | null> {
        try {
            const response = await axios.post<Role>(API_URL, role);
            return response.data;
        } catch (error) {
            console.error("Error al crear role:", error);
            throw error;
        }
    }

    async updateRole(id: number, role: Partial<Role>): Promise<Role | null> {
        try {
            const response = await axios.put<Role>(`${API_URL}/${id}`, role);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar role:", error);
            throw error;
        }
    }

    async deleteRole(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar role:", error);
            return false;
        }
    }
}

const roleService = new RoleService();
export default roleService;
