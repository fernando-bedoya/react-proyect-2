import { lazy } from 'react';

const Calendar = lazy(() => import('./pages/Calendar'));
const Chart = lazy(() => import('./pages/Chart'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Tables = lazy(() => import('./pages/Tables'));

// Users CRUD
const UsersList = lazy(() => import('./pages/Users/List'));
const UsersCreate = lazy(() => import('./pages/Users/Create'));
const UsersUpdate = lazy(() => import('./pages/Users/Update'));

// Roles
const RolesList = lazy(() => import('./pages/Roles/List'));
const PermissionsList = lazy(() => import('./pages/Permissions/List'));
// Firebase Demo
const FirebaseDemo = lazy(() => import('./pages/Firebase/FirebaseDemo'));
const FirebaseChecker = lazy(() => import('./pages/Firebase/FirebaseChecker'));

// CRUD Views
const DigitalSignatureView = lazy(() => import('./views/digitalSignature/DigitalSignatureView.jsx'));
const DeviceView = lazy(() => import('./views/device/DeviceView.jsx'));
const SecurityQuestionView = lazy(() => import('./views/securityQuestion/SecurityQuestionView.jsx'));
const AnswerView = lazy(() => import('./views/answer/AnswerView.jsx'));
// const SessionView = lazy(() => import('./views/session/SessionView.jsx')); // Comentado temporalmente - archivo no existe

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
    path: '/roles/list',
    title: 'Roles List',
    component: RolesList,
  },
  {
    path: '/permissions/list',
    title: 'Permissions List',
    component: PermissionsList,
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
  // {
  //   path: '/sessions',
  //   title: 'Sessions',
  //   component: SessionView,
  // },
];

const routes = [...coreRoutes];
export default routes;
