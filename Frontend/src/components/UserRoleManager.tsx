import React from 'react';
import AssignRoles from './AssignRoles/AssignRoles';

// Small wrapper to expose AssignRoles as a lazy-loadable module used by routes.ts
const UserRoleManager: React.FC = () => {
  return <AssignRoles />;
};

export default UserRoleManager;
