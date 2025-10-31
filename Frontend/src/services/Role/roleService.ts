import axios from "axios";
import { Role } from "../../models/Role";

// Build API URL safely: if VITE_API_URL is provided use it, otherwise default to an empty string
const base = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : "";
const API_URL = base ? `${base.replace(/\/+$/, "")}/roles` : "/roles";
const PERMISSIONS_URL = base ? `${base.replace(/\/+$/, "")}/permissions` : "/permissions";

class RoleService {
  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<Role[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return [];
    }
  }

  async getRoleById(id: number): Promise<Role | null> {
    try {
      const response = await axios.get<Role>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Rol no encontrado:", error);
      return null;
    }
  }

  async createRole(role: Omit<Role, "id">): Promise<Role | null> {
    try {
      const response = await axios.post<Role>(API_URL, role);
      return response.data;
    } catch (error) {
      console.error("Error al crear rol:", error);
      return null;
    }
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role | null> {
    try {
      const response = await axios.put<Role>(`${API_URL}/${id}`, role);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      return null;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      return false;
    }
  }

  /**
   * Devuelve la lista de permisos disponibles en el backend
   */
  async getPermissions(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(PERMISSIONS_URL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      return [];
    }
  }

  /**
   * Asigna permisos al rol (envía arreglo de ids o slugs según la API)
   */
  async assignPermissions(roleId: number, permissions: Array<number | string>): Promise<boolean> {
    try {
      await axios.post(`${API_URL}/${roleId}/permissions`, { permissions });
      return true;
    } catch (error) {
      console.error("Error al asignar permisos:", error);
      return false;
    }
  }
}

export const roleService = new RoleService();
