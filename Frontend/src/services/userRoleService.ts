import axios from "axios";
import { UserRole } from "../models/UserRole";

const API_URL = ((import.meta as any).env?.VITE_API_URL || "") + "/user-roles";

class UserRoleService {
  private formatDateToBackend(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    // YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async getAll(): Promise<UserRole[]> {
    try {
      const resp = await axios.get<UserRole[]>(API_URL);
      return resp.data;
    } catch (error) {
      console.error("Error al obtener user-roles:", error);
      return [];
    }
  }

  async getById(id: string | number): Promise<UserRole | null> {
    try {
      const resp = await axios.get<UserRole>(`${API_URL}/${id}`);
      return resp.data;
    } catch (error) {
      console.error("Error al obtener user-role por id:", error);
      return null;
    }
  }

  async getByUserId(userId: number): Promise<UserRole[]> {
    try {
      const resp = await axios.get<UserRole[]>(`${API_URL}/user/${userId}`);
      return resp.data;
    } catch (error) {
      console.error("Error al obtener roles por usuario:", error);
      return [];
    }
  }

  async getByRoleId(roleId: number): Promise<UserRole[]> {
    try {
      const resp = await axios.get<UserRole[]>(`${API_URL}/role/${roleId}`);
      return resp.data;
    } catch (error) {
      console.error("Error al obtener usuarios por rol:", error);
      return [];
    }
  }

  /**
   * Crea una relación user-role usando la ruta definida en el backend:
   * POST /user-roles/user/<user_id>/role/<role_id>
   */
  async create(userId: number, roleId: number, data?: any): Promise<UserRole | null> {
    try {
      const payload = { ...(data || {}) };
      // backend requires startAt and endAt; if not provided, set sensible defaults
      if (!payload.startAt) {
        payload.startAt = this.formatDateToBackend(new Date());
      }
      if (!payload.endAt) {
        // default endAt to same as startAt to satisfy backend validation
        payload.endAt = payload.startAt;
      }
      const resp = await axios.post<UserRole>(`${API_URL}/user/${userId}/role/${roleId}`, payload);
      return resp.data;
    } catch (error) {
      // Log rich axios error info to help debugging (server may return JSON error body)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = error;
      if (err.response) {
        try {
          // Print full response body as JSON string to make it visible in console logs
          console.error("Error al crear user-role - status:", err.response.status,
            "response.data:", JSON.stringify(err.response.data),
            "response.headers:", err.response.headers
          );
        } catch (e) {
          console.error("Error al crear user-role - response (non-serializable):", err.response);
        }
      } else {
        console.error("Error al crear user-role:", err.message || err);
      }
      // Re-throw the original error (axios error) so the caller can extract response details
      throw error;
    }
  }

  /**
   * Asigna múltiples roles a un usuario creando relaciones individuales.
   */
  async assignRoles(userId: number, roleIds: Array<number>): Promise<boolean> {
    const clean = roleIds.filter((r) => typeof r === "number");
    if (!clean.length) return true;
    try {
      // Create relationships in parallel but capture first failure to surface it
      const promises = clean.map((roleId) => this.create(userId, roleId));
      const results = await Promise.allSettled(promises);
      const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (rejected) {
        // Surface the original error
        throw rejected.reason;
      }
      return true;
    } catch (error) {
      console.error("Error al asignar roles:", error);
      throw error;
    }
  }

  async update(userRoleId: string | number, data: any): Promise<UserRole | null> {
    try {
      const resp = await axios.put<UserRole>(`${API_URL}/${userRoleId}`, data);
      return resp.data;
    } catch (error) {
      console.error("Error al actualizar user-role:", error);
      return null;
    }
  }

  async delete(userRoleId: string | number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${userRoleId}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar user-role:", error);
      return false;
    }
  }
}

export const userRoleService = new UserRoleService();
export default userRoleService;
