import axios from '../axiosInterceptor';

type PasswordPayload = {
  content: string;
  startAt: string; // YYYY-MM-DD HH:MM:SS
  endAt: string; // YYYY-MM-DD HH:MM:SS
};

const API_URL = '/passwords';

class PasswordService {
  async getPasswords() {
    try {
      const response = await axios.get<any[]>(API_URL);
      // remove content (hash) from each item before returning
      return Array.isArray(response.data)
        ? response.data.map((it: any) => {
            const { content, ...rest } = it || {};
            return rest;
          })
        : [];
    } catch (error) {
      console.error("Error al obtener contraseñas:", error);
      return [];
    }
  }

  async getPasswordById(id: number) {
    try {
      const response = await axios.get<any>(`${API_URL}/${id}`);
      if (response?.data) {
        const { content, ...rest } = response.data;
        return rest;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener contraseña por id:", error);
      return null;
    }
  }

  async getPasswordsByUserId(userId: number) {
    try {
      const response = await axios.get<any[]>(`${API_URL}/user/${userId}`);
      return Array.isArray(response.data)
        ? response.data.map((it: any) => {
            const { content, ...rest } = it || {};
            return rest;
          })
        : [];
    } catch (error) {
      console.error("Error al obtener historial de contraseñas por usuario:", error);
      return [];
    }
  }

  async getCurrentPassword(userId: number) {
    try {
      const response = await axios.get<any>(`${API_URL}/user/${userId}/current`);
      if (response?.data) {
        const { content, ...rest } = response.data;
        return rest;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener contraseña actual del usuario:", error);
      return null;
    }
  }

  async createPassword(userId: number, payload: PasswordPayload) {
    try {
      // La ruta correcta según password_routes.py es: /passwords/user/<user_id>
      const response = await axios.post<any>(`${API_URL}/user/${userId}`, payload);
      console.log('[passwordService] Contraseña creada exitosamente:', response?.data);
      if (response?.data) {
        const { content, ...rest } = response.data;
        return rest;
      }
      return null;
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error(`[passwordService] Error al crear contraseña:`, {
        status,
        data,
        message: error?.message
      });
      throw error; // Propaga el error para que se maneje en el componente
    }
  }

  async updatePassword(id: number, payload: Partial<PasswordPayload>) {
    try {
      const response = await axios.put<any>(`${API_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      return null;
    }
  }

  async deletePassword(id: number) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar contraseña:", error);
      return false;
    }
  }
}

export const passwordService = new PasswordService();