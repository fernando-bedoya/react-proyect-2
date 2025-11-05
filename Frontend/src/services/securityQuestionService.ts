/**
 * SecurityQuestionService - Servicio para gestionar preguntas de seguridad
 * 
 * Endpoints del backend:
 * - GET    /api/security-questions/           -> Todas las preguntas
 * - GET    /api/security-questions/<id>       -> Una pregunta específica
 * - POST   /api/security-questions/           -> Crear pregunta
 * - PUT    /api/security-questions/<id>       -> Actualizar pregunta
 * - DELETE /api/security-questions/<id>       -> Eliminar pregunta
 */

import axios from 'axios';

export interface SecurityQuestion {
  id?: number;
  name: string;           // Texto de la pregunta
  description?: string;   // Descripción opcional
  created_at?: string;
  updated_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SecurityQuestionService {
  private readonly BASE_URL = `${API_URL}/security-questions`;

  /**
   * Obtener todas las preguntas de seguridad
   */
  async getAll(): Promise<SecurityQuestion[]> {
    const response = await axios.get(this.BASE_URL);
    return response.data;
  }

  /**
   * Obtener una pregunta específica por ID
   */
  async getById(id: number): Promise<SecurityQuestion> {
    const response = await axios.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Crear nueva pregunta de seguridad
   * @param data { name, description? }
   */
  async create(data: Omit<SecurityQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityQuestion> {
    const response = await axios.post(this.BASE_URL, data);
    return response.data;
  }

  /**
   * Actualizar pregunta existente
   */
  async update(id: number, data: Partial<SecurityQuestion>): Promise<SecurityQuestion> {
    const response = await axios.put(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar pregunta de seguridad
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new SecurityQuestionService();
