import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Paper, Snackbar, Alert, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { userService } from "../../services/userService";
import { roleService } from "../../services/Role/roleService";
import { userRoleService } from "../../services/userRoleService";
import type { User } from "../../models/User";
import type { Role } from "../../models/Role";

/**
 * Componente para asignar uno o varios roles a un usuario.
 * - Usa Autocomplete para seleccionar usuario
 * - Usa Autocomplete multiple para seleccionar roles
 * - Botón 'Asignar' que llama a userRoleService.assignRoles
 * Buenas prácticas: hooks, manejo de errores, modularidad.
 * Usa color 'warning' (amarillo) para el tema visual solicitado.
 */
export const AssignRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>(
    { open: false, message: "", severity: "info" }
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [u, r] = await Promise.all([userService.getUsers(), roleService.getRoles()]);
        if (!mounted) return;
        setUsers(u || []);
        setRoles(r || []);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Error cargando usuarios/roles", severity: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !selectedRoles.length) return;
    setLoading(true);
    try {
      const roleIds = selectedRoles.map((r) => r.id).filter((id): id is number => typeof id === "number");
      const ok = await userRoleService.assignRoles(selectedUser.id as number, roleIds);
      if (ok) {
        setSnackbar({ open: true, message: "Roles asignados correctamente", severity: "success" });
        // Actualizar estado local del usuario (si existe el arreglo roles)
        setUsers((prev) => prev.map(u => u.id === selectedUser.id ? { ...u, roles: Array.from(new Map([...(u.roles || []), ...selectedRoles].map(r=>[(r as Role).id, r])).values()) } : u));
      } else {
        setSnackbar({ open: true, message: "No se pudieron asignar los roles", severity: "error" });
      }
    } catch (error: any) {
      console.error(error);
      // Robust extraction of server message
      let serverMsg: string = "Error al asignar roles";
      try {
        if (error?.response?.data) {
          const data = error.response.data;
          // Prefer common fields
          serverMsg = data.message || data.error || JSON.stringify(data);
        } else if (error?.message) {
          serverMsg = String(error.message);
        }
      } catch (e) {
        serverMsg = String(error?.message || "Error al asignar roles");
      }
      setSnackbar({ open: true, message: serverMsg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, width: "100%", maxWidth: 900 }} elevation={3}>
      <Typography variant="h6" gutterBottom>Asignar roles a usuario</Typography>

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Cargando...</Typography>
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Autocomplete
          options={users}
          getOptionLabel={(u) => u.name || u.email || String(u.id)}
          value={selectedUser}
          onChange={(_, value) => setSelectedUser(value)}
          renderInput={(params) => <TextField {...params} label="Seleccionar usuario" placeholder="Buscar usuario..." />}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />

        <Autocomplete
          multiple
          options={roles}
          getOptionLabel={(r) => r.name || String(r.id)}
          value={selectedRoles}
          onChange={(_, value) => setSelectedRoles(value)}
          renderTags={(value: Role[], getTagProps) =>
            value.map((option: Role, index: number) => (
              <Chip
                label={option.name || `#${option.id}`}
                {...getTagProps({ index })}
                color="warning"
                key={option.id}
              />
            ))
          }
          renderInput={(params) => <TextField {...params} label="Seleccionar roles" placeholder="Roles..." />}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
      </Box>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="warning"
          disabled={!selectedUser || selectedRoles.length === 0 || loading}
          onClick={handleAssign}
        >
          Asignar
        </Button>

        <Button
          variant="outlined"
          onClick={() => { setSelectedUser(null); setSelectedRoles([]); }}
        >
          Limpiar
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AssignRoles;
