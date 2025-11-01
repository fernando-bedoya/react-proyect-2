import axios from 'axios';
import { Session } from '../models/Session';

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_PATH = '/sessions';

class SessionService {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    try {
      const response = await axios.get(`${API_URL}${BASE_PATH}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await axios.get(`${API_URL}${BASE_PATH}/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all sessions for a specific user
   */
  async getSessionsByUserId(userId: number): Promise<Session[]> {
    try {
      const response = await axios.get(`${API_URL}${BASE_PATH}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new session for a user
   * Note: expiration should be formatted as "YYYY-MM-DD HH:MM:SS"
   * Example: "2025-12-31 23:59:59"
   */
  async createSession(userId: number, sessionData: Partial<Session>): Promise<Session> {
    try {
      // Format expiration date if it's a Date object
      const payload: any = { ...sessionData };
      
      if (payload.expiration instanceof Date) {
        // Format to "YYYY-MM-DD HH:MM:SS"
        const year = payload.expiration.getFullYear();
        const month = String(payload.expiration.getMonth() + 1).padStart(2, '0');
        const day = String(payload.expiration.getDate()).padStart(2, '0');
        const hours = String(payload.expiration.getHours()).padStart(2, '0');
        const minutes = String(payload.expiration.getMinutes()).padStart(2, '0');
        const seconds = String(payload.expiration.getSeconds()).padStart(2, '0');
        payload.expiration = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      const response = await axios.post(
        `${API_URL}${BASE_PATH}/user/${userId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing session
   * Note: expiration should be formatted as "YYYY-MM-DD HH:MM:SS"
   */
  async updateSession(sessionId: string, sessionData: Partial<Session>): Promise<Session> {
    try {
      // Format expiration date if it's a Date object
      const payload: any = { ...sessionData };
      
      if (payload.expiration instanceof Date) {
        const year = payload.expiration.getFullYear();
        const month = String(payload.expiration.getMonth() + 1).padStart(2, '0');
        const day = String(payload.expiration.getDate()).padStart(2, '0');
        const hours = String(payload.expiration.getHours()).padStart(2, '0');
        const minutes = String(payload.expiration.getMinutes()).padStart(2, '0');
        const seconds = String(payload.expiration.getSeconds()).padStart(2, '0');
        payload.expiration = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      const response = await axios.put(
        `${API_URL}${BASE_PATH}/${sessionId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}${BASE_PATH}/${sessionId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      return false;
    }
  }
}

export default new SessionService();
