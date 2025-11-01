import axiosInstance from './axiosInterceptor';
import { RolePermission } from '../models/RolePermission';

const API_URL = (import.meta as any).env?.VITE_API_URL || '';
const BASE_PATH = '/role-permissions';

class RolePermissionService {
  /**
   * Get all role-permission relationships
   */
  async getRolePermissions(): Promise<RolePermission[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}${BASE_PATH}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role-permissions:', error);
      throw error;
    }
  }

  /**
   * Get a role-permission relationship by ID
   */
  async getRolePermissionById(id: string): Promise<RolePermission> {
    try {
      const response = await axiosInstance.get(`${API_URL}${BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role-permission ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all permissions for a specific role
   */
  async getPermissionsByRoleId(roleId: number): Promise<RolePermission[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}${BASE_PATH}/role/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all roles that have a specific permission
   */
  async getRolesByPermissionId(permissionId: number): Promise<RolePermission[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}${BASE_PATH}/permission/${permissionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching roles for permission ${permissionId}:`, error);
      throw error;
    }
  }

  /**
   * Assign a permission to a role
   * Creates a new role-permission relationship
   */
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    try {
      const response = await axiosInstance.post(
        `${API_URL}${BASE_PATH}/role/${roleId}/permission/${permissionId}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning permission ${permissionId} to role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    try {
      await axiosInstance.delete(
        `${API_URL}${BASE_PATH}/role/${roleId}/permission/${permissionId}`
      );
      return true;
    } catch (error) {
      console.error(`Error removing permission ${permissionId} from role ${roleId}:`, error);
      return false;
    }
  }

  /**
   * Delete a role-permission relationship by ID
   */
  async deleteRolePermission(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`${API_URL}${BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting role-permission ${id}:`, error);
      return false;
    }
  }

  /**
   * Batch assign/remove permissions to a role
   * Useful for checkbox selection scenarios
   */
  async syncRolePermissions(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      // Get current permissions
      const current = await this.getPermissionsByRoleId(roleId);
      const currentIds = current.map(rp => rp.permission_id as number);

      // Determine what to add and what to remove
      const toAdd = permissionIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !permissionIds.includes(id));

      // Execute additions
      for (const permId of toAdd) {
        await this.assignPermissionToRole(roleId, permId);
      }

      // Execute removals
      for (const permId of toRemove) {
        await this.removePermissionFromRole(roleId, permId);
      }

      return true;
    } catch (error) {
      console.error(`Error syncing permissions for role ${roleId}:`, error);
      throw error;
    }
  }
}

export default new RolePermissionService();
