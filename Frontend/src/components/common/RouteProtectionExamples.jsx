// RouteProtectionExamples.jsx - Ejemplos de uso de componentes de protección de rutas
// Este archivo contiene ejemplos prácticos de cómo usar los componentes AuthGuard y PrivateRoute
// Sirve como guía de referencia para implementar protección de rutas en la aplicación

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar componentes de protección
import AuthGuard from './AuthGuard';
import PrivateRoute from './PrivateRoute';
import { useAuth } from './PrivateRoute';

// ============================================
// EJEMPLO 1: Uso básico de AuthGuard
// ============================================
const Example1_BasicAuthGuard = () => {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Ruta protegida con AuthGuard */}
      <Route 
        path="/dashboard" 
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        } 
      />
    </Routes>
  );
};

// ============================================
// EJEMPLO 2: AuthGuard con redirección personalizada
// ============================================
const Example2_CustomRedirect = () => {
  return (
    <Routes>
      <Route path="/auth/signin" element={<SignInPage />} />
      
      {/* Redirigir a una ruta personalizada */}
      <Route 
        path="/admin" 
        element={
          <AuthGuard redirectTo="/auth/signin">
            <AdminPanel />
          </AuthGuard>
        } 
      />
    </Routes>
  );
};

// ============================================
// EJEMPLO 3: Uso de PrivateRoute con spinner
// ============================================
const Example3_PrivateRouteWithSpinner = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* PrivateRoute muestra un spinner mientras verifica */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

// ============================================
// EJEMPLO 4: Múltiples rutas protegidas
// ============================================
const Example4_MultipleProtectedRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/devices" 
        element={
          <PrivateRoute>
            <DevicesPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/security-questions" 
        element={
          <PrivateRoute>
            <SecurityQuestionsPage />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

// ============================================
// EJEMPLO 5: Layout con rutas protegidas anidadas
// ============================================
const Example5_NestedProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Layout protegido con rutas anidadas */}
      <Route 
        path="/*" 
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

// ============================================
// EJEMPLO 6: Uso del hook useAuth
// ============================================
const Example6_UseAuthHook = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Bienvenido, {user?.username || user?.email}</h2>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <div>
          <h2>Por favor inicie sesión</h2>
          <a href="/login">Ir al Login</a>
        </div>
      )}
    </div>
  );
};

// ============================================
// EJEMPLO 7: Componente de navegación con verificación
// ============================================
const Example7_NavbarWithAuth = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Mi App</a>
        
        <div className="navbar-nav ms-auto">
          {isAuthenticated ? (
            <>
              <span className="navbar-text me-3">
                Hola, {user?.username}
              </span>
              <button 
                className="btn btn-outline-danger btn-sm" 
                onClick={logout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <a className="btn btn-primary btn-sm" href="/login">
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

// ============================================
// EJEMPLO 8: Configuración completa de rutas
// ============================================
const Example8_CompleteRouteSetup = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== RUTAS PÚBLICAS ========== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* ========== RUTAS PROTEGIDAS ========== */}
        
        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        
        {/* Dispositivos */}
        <Route 
          path="/devices" 
          element={
            <PrivateRoute>
              <DeviceView />
            </PrivateRoute>
          } 
        />
        
        {/* Preguntas de Seguridad */}
        <Route 
          path="/security-questions" 
          element={
            <PrivateRoute>
              <SecurityQuestionView />
            </PrivateRoute>
          } 
        />
        
        {/* Respuestas */}
        <Route 
          path="/answers" 
          element={
            <PrivateRoute>
              <AnswerView />
            </PrivateRoute>
          } 
        />
        
        {/* Firmas Digitales */}
        <Route 
          path="/digital-signatures" 
          element={
            <PrivateRoute>
              <DigitalSignatureView />
            </PrivateRoute>
          } 
        />
        
        {/* Perfil de Usuario */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        
        {/* Configuración */}
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

// ============================================
// COMPONENTES DE EJEMPLO (Placeholders)
// ============================================
const HomePage = () => <div><h1>Página de Inicio</h1></div>;
const LoginPage = () => <div><h1>Login</h1></div>;
const RegisterPage = () => <div><h1>Registro</h1></div>;
const ForgotPasswordPage = () => <div><h1>Recuperar Contraseña</h1></div>;
const DashboardPage = () => <div><h1>Dashboard</h1></div>;
const ProfilePage = () => <div><h1>Perfil</h1></div>;
const SettingsPage = () => <div><h1>Configuración</h1></div>;
const AdminPanel = () => <div><h1>Panel de Administración</h1></div>;
const DevicesPage = () => <div><h1>Dispositivos</h1></div>;
const UsersPage = () => <div><h1>Usuarios</h1></div>;
const SecurityQuestionsPage = () => <div><h1>Preguntas de Seguridad</h1></div>;
const MainLayout = () => <div><h1>Layout Principal</h1></div>;
const NotFoundPage = () => <div><h1>404 - Página no encontrada</h1></div>;
const SignInPage = () => <div><h1>Sign In</h1></div>;
const DeviceView = () => <div><h1>Vista de Dispositivos</h1></div>;
const SecurityQuestionView = () => <div><h1>Vista de Preguntas</h1></div>;
const AnswerView = () => <div><h1>Vista de Respuestas</h1></div>;
const DigitalSignatureView = () => <div><h1>Vista de Firmas</h1></div>;

// ============================================
// EXPORTAR EJEMPLOS
// ============================================
export {
  Example1_BasicAuthGuard,
  Example2_CustomRedirect,
  Example3_PrivateRouteWithSpinner,
  Example4_MultipleProtectedRoutes,
  Example5_NestedProtectedRoutes,
  Example6_UseAuthHook,
  Example7_NavbarWithAuth,
  Example8_CompleteRouteSetup,
};
