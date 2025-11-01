import React, { useState, useEffect } from 'react';
import GenericEntityForm, { FieldDef } from './GenericEntityForm';
import userService from '../../services/userService';
import { User } from '../../models/User';

interface SessionFormValidatorProps {
  mode: 1 | 2; // 1 = create, 2 = update
  initialValues?: { [key: string]: any } | null;
  onCreate?: (values: { [key: string]: any }) => Promise<any> | any;
  onUpdate?: (values: { [key: string]: any }) => Promise<any> | any;
  submitLabel?: string;
}

const SessionFormValidator: React.FC<SessionFormValidatorProps> = ({
  mode,
  initialValues = null,
  onCreate,
  onUpdate,
  submitLabel,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Format default expiration to 24 hours from now
  const getDefaultExpiration = (): string => {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Define fields based on mode
  const fields: FieldDef[] = [
    // User ID - only show in create mode
    ...(mode === 1
      ? [
          {
            name: 'user_id',
            label: 'Usuario',
            type: 'select' as const,
            required: true,
            options: users.map((user) => ({
              value: user.id as number,
              label: `${user.id} - ${user.name} (${user.email})`,
            })),
            placeholder: loadingUsers ? 'Cargando usuarios...' : 'Seleccione un usuario',
          },
        ]
      : []),
    {
      name: 'token',
      label: 'Token',
      type: 'text' as const,
      required: false,
      placeholder: 'Dejar vacío para generar automáticamente (UUID)',
    },
    {
      name: 'expiration',
      label: 'Fecha de Expiración',
      type: 'text' as const,
      required: true,
      placeholder: 'YYYY-MM-DDTHH:MM',
    },
    {
      name: 'FACode',
      label: 'Código FA',
      type: 'text' as const,
      required: false,
      placeholder: 'Código de autenticación de dos factores (opcional)',
    },
    {
      name: 'state',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'expired', label: 'Expirado' },
        { value: 'revoked', label: 'Revocado' },
      ],
    },
  ];

  // Set default values for create mode
  const defaultValues = mode === 1
    ? {
        user_id: '',
        token: '',
        expiration: getDefaultExpiration(),
        FACode: '',
        state: 'active',
      }
    : initialValues;

  return (
    <div>
      {loadingUsers && mode === 1 ? (
        <div className="text-center py-4">
          <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full inline-block" />
          <p className="mt-2 text-sm text-muted">Cargando usuarios...</p>
        </div>
      ) : (
        <GenericEntityForm
          mode={mode}
          fields={fields}
          initialValues={defaultValues}
          onCreate={onCreate}
          onUpdate={onUpdate}
          submitLabel={submitLabel}
        />
      )}
      
      {/* Helper text for expiration field */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-boxdark-2 rounded text-sm text-blue-800 dark:text-blue-200">
        <strong>Nota sobre la fecha de expiración:</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Este campo es <strong>obligatorio</strong> (requerimiento del backend)</li>
          <li>Formato esperado: <code>YYYY-MM-DDTHH:MM</code> (ejemplo: 2025-12-31T23:59)</li>
          <li>Por defecto se establece 24 horas desde ahora</li>
          <li>El sistema convertirá automáticamente al formato del backend</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionFormValidator;
