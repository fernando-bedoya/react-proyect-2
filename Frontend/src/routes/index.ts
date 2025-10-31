import { lazy } from 'react';

const Calendar = lazy(() => import('../pages/Calendar'));
const Chart = lazy(() => import('../pages/Chart'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const Demo= lazy(() => import('../pages/Demo'));
const ListUsers = lazy(() => import('../pages/Users/List'));
const CreateUser = lazy(() => import('../pages/Users/Create'));
const UpdateUser = lazy(() => import('../pages/Users/Update'));
const Roles = lazy(() => import('../pages/Roles/List'));
const Permissions = lazy(() => import('../pages/Permissions/List'));

const coreRoutes = [
  {
    path: '/demo',
    title: 'Demo',
    component: Demo,
  },
  {
    path: '/users/list',
    title: 'List Users',
    component: ListUsers,
  },
  {
    path: '/roles/list',
    title: 'List Roles',
    component: Roles,
  },
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
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
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
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  {
    path: '/users/create',
    title: 'Create Users',
    component: CreateUser,
  },
  {
    path: '/users/update/:id',
    title: 'Update Users',
    component: UpdateUser,
  },
  {
    path: '/permissions/list',
    title: 'List Permissions',
    component: Permissions,
  },
];

const routes = [...coreRoutes];
export default routes;
