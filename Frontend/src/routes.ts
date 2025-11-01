import { lazy } from 'react';

const Calendar = lazy(() => import('./pages/Calendar'));
const Chart = lazy(() => import('./pages/Chart'));
const Profile = lazy(() => import('./pages/Profile'));
const UserProfile = lazy(() => import('./pages/Profile/UserProfile')); // Nueva página de perfil de usuario
const Settings = lazy(() => import('./pages/Settings'));
const Tables = lazy(() => import('./pages/Tables'));

// Users CRUD
const UsersList = lazy(() => import('./pages/Users/List'));
const UsersCreate = lazy(() => import('./pages/Users/Create'));
const UsersUpdate = lazy(() => import('./pages/Users/Update'));

// Roles
const RolesList = lazy(() => import('./pages/Roles/List'));
const RolesCreate = lazy(() => import('./pages/Roles/Create'));
const RolesUpdate = lazy(() => import('./pages/Roles/Update'));

// User role manager (assign roles to users)
const UserRoleManager = lazy(() => import('./components/UserRoleManager'));

const PermissionsList = lazy(() => import('./pages/Permissions/List'));
const PermissionsCreate = lazy(() => import('./pages/Permissions/Create'));

// Administrator
const AdministratorList = lazy(() => import('./pages/Administrator/List'));
const AdministratorPermissions = lazy(() => import('./pages/Administrator/Permissions'));

//Sessions
const SessionsList = lazy(() => import('./pages/Session/List'));
const SessionsCreate = lazy(() => import('./pages/Session/Create'));
// Firebase Demo
const FirebaseDemo = lazy(() => import('./pages/Firebase/FirebaseDemo'));
const FirebaseChecker = lazy(() => import('./pages/Firebase/FirebaseChecker'));

// Passwords
const PasswordsList = lazy(() => import('./pages/password/List'));
const PasswordsCreate = lazy(() => import('./pages/password/Create'));
const PasswordsUpdate = lazy(() => import('./pages/password/Update'));

// CRUD Views (Con funcionalidad completa - Crear/Editar/Eliminar activados)
const DigitalSignatureView = lazy(() => import('./views/digitalSignature/DigitalSignatureViewReusable'));
const DeviceView = lazy(() => import('./views/device/DeviceViewReusable'));
const SecurityQuestionView = lazy(() => import('./views/securityQuestion/SecurityQuestionViewReusable'));
const AnswerView = lazy(() => import('./views/answer/AnswerViewReusable'));
// const SessionView = lazy(() => import('./views/session/SessionView.jsx')); // Archivo no existe aún
const UserView = lazy(() => import('./views/user/UserView.jsx'));

const coreRoutes = [
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
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
    path: '/chart',
    title: 'Chart',
    component: Chart,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/users/list',
    title: 'Users List',
    component: UsersList,
  },
  {
    path: '/users/create',
    title: 'Create User',
    component: UsersCreate,
  },
  {
    path: '/users/update/:id',
    title: 'Update User',
    component: UsersUpdate,
  },
  {
    path: '/users/assign-roles',
    title: 'Assign Roles',
    component: UserRoleManager,
  },
  {
    path: '/roles/list',
    title: 'Roles List',
    component: RolesList,
  },
  {
    path: '/roles/create',
    title: 'Create Role',
    component: RolesCreate,
  },
  {
    path: '/roles/update/:id',
    title: 'Update Role',
    component: RolesUpdate,
  },
  {
    path: '/permissions/list',
    title: 'Permissions List',
    component: PermissionsList,
  },
  {
    path: '/permissions/create',
    title: 'Create Permission',
    component: PermissionsCreate,
  },
  {
    path: '/administrator/list',
    title: 'Administrator List',
    component: AdministratorList,
  },
  {
    path: '/administrator/permissions',
    title: 'Administrator Permissions',
    component: AdministratorPermissions,
  },
  // Permissions update handled via Create page with ?edit=<id>
  {
    path: '/sessions/list',
    title: 'Sessions List',
    component: SessionsList,
  },
  {
    path: '/sessions/create',
    title: 'Create Session',
    component: SessionsCreate,
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
    component: PasswordsList,
  },
  {
    path: '/passwords/create',
    title: 'Create Password',
    component: PasswordsCreate,
  },
  {
    path: '/passwords/update/:id',
    title: 'Update Password',
    component: PasswordsUpdate,
  },
  // {
  //   path: '/sessions',
  //   title: 'Sessions',
  //   component: SessionView,
  // },
  {
    path: '/users',
    title: 'Gestión de Usuarios',
    component: UserView,
  },
];

const routes = [...coreRoutes];
export default routes;
