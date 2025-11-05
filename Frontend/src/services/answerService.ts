/**
 * AnswerService - Servicio para gestionar respuestas de seguridad
 * 
 * Endpoints del backend:
 * - GET    /api/answers/                                      -> Todas las respuestas
 * - GET    /api/answers/<id>                                  -> Una respuesta específica
 * - GET    /api/answers/user/<user_id>                        -> Todas las respuestas de un usuario
 * - GET    /api/answers/question/<question_id>                -> Respuestas de una pregunta
 * - GET    /api/answers/user/<user_id>/question/<question_id> -> Respuesta específica user+question
 * - POST   /api/answers/user/<user_id>/question/<question_id> -> Crear respuesta
 * - PUT    /api/answers/<id>                                  -> Actualizar respuesta
 * - DELETE /api/answers/<id>                                  -> Eliminar respuesta
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Answer {
  id?: number;
  user_id: number;
  security_question_id: number;
  content: string;          // Respuesta del usuario
  created_at?: string;
  updated_at?: string;
}

class AnswerService {
  private readonly BASE_URL = `${API_URL}/answers`;

  /**
   * Obtener todas las respuestas
   */
  async getAll(): Promise<Answer[]> {
    const response = await axios.get(this.BASE_URL);
    return response.data;
  }

  /**
   * Obtener una respuesta específica por ID
   */
  async getById(id: number): Promise<Answer> {
    const response = await axios.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Obtener todas las respuestas de un usuario
   * Útil para mostrar qué preguntas ya respondió
   */
  async getByUserId(userId: number): Promise<Answer[]> {
    const response = await axios.get(`${this.BASE_URL}/user/${userId}`);
    return response.data;
  }

  /**
   * Obtener todas las respuestas de una pregunta específica
   * (todas las personas que respondieron esa pregunta)
   */
  async getByQuestionId(questionId: number): Promise<Answer[]> {
    const response = await axios.get(`${this.BASE_URL}/question/${questionId}`);
    return response.data;
  }

  /**
   * Obtener respuesta específica de un usuario para una pregunta
   * Útil para verificar si ya respondió esta pregunta
   */
  async getUserAnswerForQuestion(userId: number, questionId: number): Promise<Answer | null> {
    try {
      const response = await axios.get(`${this.BASE_URL}/user/${userId}/question/${questionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No existe respuesta aún
      }
      throw error;
    }
  }

  /**
   * Crear nueva respuesta para un usuario y pregunta
   * Backend valida que no exista ya una respuesta para esta combinación
   * 
   * @param userId ID del usuario
   * @param questionId ID de la pregunta de seguridad
   * @param content Respuesta del usuario
   */
  async create(userId: number, questionId: number, content: string): Promise<Answer> {
    const response = await axios.post(
      `${this.BASE_URL}/user/${userId}/question/${questionId}`,
      { content }
    );
    return response.data;
  }

  /**
   * Actualizar respuesta existente
   * Solo se puede actualizar el content (la respuesta)
   */
  async update(id: number, content: string): Promise<Answer> {
    const response = await axios.put(`${this.BASE_URL}/${id}`, { content });
    return response.data;
  }

  /**
   * Eliminar respuesta de seguridad
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new AnswerService();
