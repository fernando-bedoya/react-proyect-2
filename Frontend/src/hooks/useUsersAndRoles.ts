import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { Role } from '../models/Role';
import roleService from '../services/roleService';
import { User } from '../models/User';
import userRoleService from '../services/userRoleService';

type UseUsersAndRolesResult = {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getUserRoles: (userId: number | string) => Promise<any>;
  assignRoles: (userId: number | string, roleIds: Array<number | string>, opts?: { startAt?: string; endAt?: string }) => Promise<any>;
};

export function useUsersAndRoles(): UseUsersAndRolesResult {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([userService.getUsers(), roleService.getRoles()]);
      setUsers(u || []);
      setRoles(r || []);
    } catch (err: any) {
      setError(err?.message || 'Error cargando usuarios o roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function getUserRoles(userId: number | string) {
    try {
      return await userRoleService.getByUserId(Number(userId));
    } catch (err) {
      throw err;
    }
  }

  async function assignRoles(userId: number | string, roleIds: Array<number | string>) {
    try {
      // userRoleService.assignRoles expects (userId, roleIds)
      const res = await userRoleService.assignRoles(Number(userId), (roleIds as Array<any>).map((r) => Number(r)));
      // revalidate lists (roles per user might have changed)
      await load();
      return res;
    } catch (err) {
      throw err;
    }
  }

  return { users, roles, loading, error, refresh: load, getUserRoles, assignRoles };
}

export default useUsersAndRoles;
