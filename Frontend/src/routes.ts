import { lazy } from 'react';

// Páginas principales
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/Profile/UserProfile'));
const Settings = lazy(() => import('./pages/Settings'));

// 🔄 REFACTORIZADO: Users CRUD usando GenericCRUDView
const UserViewGeneric = lazy(() => import('./views/user/UserViewGeneric'));
const UsersRolesList = lazy(() => import('./pages/Users-Roles/List'));
const UsersRolesUpdate = lazy(() => import('./pages/Users-Roles/Update'));

// 🔄 REFACTORIZADO: Address CRUD usando GenericCRUDView
const AddressView = lazy(() => import('./views/address/AddressView'));

// 🔄 REFACTORIZADO: Roles CRUD usando GenericCRUDView
const RoleView = lazy(() => import('./views/role/RoleView'));
const RoleDetailView = lazy(() => import('./views/role/RoleDetailView'));

// User role manager (assign roles to users)
const UserRoleManager = lazy(() => import('./components/UserRoleManager'));

// 🔄 REFACTORIZADO: Permissions CRUD usando GenericCRUDView
const PermissionView = lazy(() => import('./views/permission/PermissionView'));

// Administrator
const AdministratorList = lazy(() => import('./pages/Administrator/List'));
const AdministratorPermissions = lazy(() => import('./pages/Administrator/Permissions'));

// 🔄 REFACTORIZADO: Sessions CRUD usando GenericCRUDView
const SessionView = lazy(() => import('./views/session/SessionView'));

// Firebase Demo
const FirebaseDemo = lazy(() => import('./pages/Firebase/FirebaseDemo'));
const FirebaseChecker = lazy(() => import('./pages/Firebase/FirebaseChecker'));

// 🔄 REFACTORIZADO: Passwords CRUD usando GenericCRUDView
const PasswordView = lazy(() => import('./views/password/PasswordView'));

// 🔄 REFACTORIZADO: CRUD Views usando GenericCRUDView (Con funcionalidad completa)
const DigitalSignatureView = lazy(() => import('./views/digitalSignature/DigitalSignatureView'));
const DeviceView = lazy(() => import('./views/device/DeviceView'));
const SecurityQuestionView = lazy(() => import('./views/securityQuestion/SecurityQuestionView'));
const AnswerView = lazy(() => import('./views/answer/AnswerView'));

// 🆕 NUEVAS RUTAS PARA SIDEBAR MEJORADO
// Rutas para gestión de permisos de roles y historial de contraseñas
const RolePermissionsList = lazy(() => import('./pages/Administrator/List')); // Reutilizando componente existente
const UserAnswersList = lazy(() => import('./views/answer/AnswerView')); // Reutilizando componente existente

const coreRoutes = [
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/profile/:id',
    title: 'User Profile',
    component: UserProfile,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/users/list',
    title: 'Users List',
    component: UserViewGeneric,
  },
  {
    path: '/user-roles/update/:id',
    title: 'Update User Roles',
    component: UsersRolesUpdate,
  },
  {
    path: '/users/assign-roles',
    title: 'Assign Roles',
    component: UserRoleManager,
  },
  {
    path: '/user-roles',
    title: 'Users - Roles',
    component: UsersRolesList,
  },
  {
    path: '/user-roles/:roleId',
    title: 'Users - Roles (por rol)',
    component: UsersRolesList,
  },
  {
    path: '/addresses',
    title: 'Direcciones',
    component: AddressView,
  },
  {
    path: '/roles/list',
    title: 'Roles List',
    component: RoleView,
  },
  {
    path: '/roles/view/:id',
    title: 'Role Details',
    component: RoleDetailView,
  },
  {
    path: '/permissions/list',
    title: 'Permissions List',
    component: PermissionView,
  },
  {
    path: '/permissions/list/:roleId',
    title: 'Permissions List (por role)',
    component: PermissionView,
  },
  {
    path: '/permissions-roles/list',
    title: 'Permisos a Roles - List',
    component: AdministratorList,
  },
  {
    path: '/administrator/permissions',
    title: 'Administrator Permissions',
    component: AdministratorPermissions,
  },
  {
    path: '/sessions/list',
    title: 'Sessions List',
    component: SessionView,
  },
  {
    path: '/firebase',
    title: 'Firebase Demo',
    component: FirebaseDemo,
  },
  {
    path: '/firebase/checker',
    title: 'Firebase Checker',
    component: FirebaseChecker,
  },
  {
    path: '/digital-signatures',
    title: 'Digital Signatures',
    component: DigitalSignatureView,
  },
  {
    path: '/devices',
    title: 'Devices',
    component: DeviceView,
  },
  {
    path: '/security-questions',
    title: 'Security Questions',
    component: SecurityQuestionView,
  },
  {
    path: '/answers',
    title: 'Answers',
    component: AnswerView,
  },
  {
    path: '/passwords/list',
    title: 'Passwords List',
    component: PasswordView,
  },
  // {
  //   path: '/sessions',
  //   title: 'Sessions',
  //   component: SessionView,
  // },
  // {
  //   path: '/users',
  //   title: 'Gestión de Usuarios',
  //   component: UserView, // OBSOLETO: usar UserViewGeneric en /users/list
  // },
  // 🆕 RUTAS ADICIONALES PARA NUEVO SIDEBAR
  {
    path: '/role-permissions',
    title: 'Role Permissions',
    component: RolePermissionsList, // Asignación de permisos a roles
  },
  {
    path: '/password-history',
    title: 'Password History',
    component: PasswordView, // Historial de contraseñas
  },
  {
    path: '/user-answers',
    title: 'User Answers',
    component: UserAnswersList, // Respuestas de usuarios a preguntas de seguridad
  },
];

const routes = [...coreRoutes];
export default routes;
