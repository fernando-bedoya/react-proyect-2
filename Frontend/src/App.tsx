// App.tsx - Configuración principal de rutas con sistema de Guardianes e Interceptores
// 
// 🛡️ SISTEMA DE GUARDIANES (GUARDS) E INTERCEPTORES:
// Este archivo implementa un patrón de seguridad de múltiples capas para proteger las rutas
//
// 📋 ARQUITECTURA DE SEGURIDAD:
// 
// 1️⃣ RUTAS PÚBLICAS (sin guardián):
//    - /auth/signin: Página de inicio de sesión
//    - /auth/signup: Página de registro
//    - Estas rutas NO tienen sidebar ni header (solo AuthLayout)
//    - Accesibles sin autenticación
//
// 2️⃣ RUTAS PROTEGIDAS (con guardián ProtectedRoute):
//    - Todas las demás rutas del sistema (/, /users, /dashboard, etc.)
//    - Envueltas en <ProtectedRoute> que actúa como INTERCEPTOR
//    - Solo accesibles después de autenticación exitosa
//    - Incluyen DefaultLayout con sidebar y header
//
// 🔒 FUNCIONAMIENTO DEL GUARDIÁN (ProtectedRoute):
//    Capa 1: Verifica tokens en localStorage (persistencia)
//    Capa 2: Valida con SecurityService (lógica de negocio)
//    Capa 3: Sincroniza con Redux Store (estado global)
//    
//    Si alguna capa falla → Redirige a /auth/signin
//    Si todas pasan → Permite acceso al contenido
//
// 🔄 FLUJO DE AUTENTICACIÓN:
//    Login → SecurityService guarda tokens → Redux actualizado → localStorage sincronizado
//    → Guardián verifica → Acceso permitido → Usuario ve contenido protegido
//
import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import Loader from './common/Loader';
import routes from './routes';
import ProtectedRoute from './components/ProtectedRoute';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        {/* 🔓 Rutas públicas - SIN layout (sin sidebar ni header) */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* 🔐 Rutas protegidas - CON layout (con sidebar y header, solo para usuarios autenticados) */}
        <Route element={
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
        }>
          <Route index element={<div className="p-4"><h1 className="text-2xl font-bold">Dashboard</h1></div>} />
          {routes.map((routes, index) => {
            const { path, component: Component } = routes;
            return (
              <Route
                key={index}
                path={path}
                element={
                  <Suspense fallback={<Loader />}>
                    <Component />
                  </Suspense>
                }
              />
            );
          })}
        </Route>
      </Routes>
    </>
  );
}

export default App;
