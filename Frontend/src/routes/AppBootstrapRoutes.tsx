import { Routes, Route } from 'react-router-dom';

// Layouts
import DefaultLayoutBootstrap from '../layout/DefaultLayoutBootstrap';

// Pages
import DashboardBootstrap from '../pages/DashboardBootstrap';

// Componentes de ejemplo existentes (si los tienes)
// import Calendar from '../pages/Calendar';
// import Profile from '../pages/Profile';
// import Settings from '../pages/Settings';
// import Tables from '../pages/Tables';
// import Chart from '../pages/Chart';

/**
 * Ejemplo de configuración de rutas usando el nuevo Layout Bootstrap
 * 
 * OPCIÓN 1: Reemplazar completamente tu App.tsx con este código
 * OPCIÓN 2: Copiar solo las rutas que necesites
 */

function AppBootstrapRoutes() {
  return (
    <Routes>
      {/* Rutas con el Layout Bootstrap */}
      <Route path="/" element={<DefaultLayoutBootstrap />}>
        {/* Dashboard Principal */}
        <Route index element={<DashboardBootstrap />} />
        
        {/* Otras páginas - Descomenta cuando las tengas listas */}
        {/* <Route path="calendar" element={<Calendar />} /> */}
        {/* <Route path="profile" element={<Profile />} /> */}
        {/* <Route path="settings" element={<Settings />} /> */}
        {/* <Route path="tables" element={<Tables />} /> */}
        {/* <Route path="chart" element={<Chart />} /> */}

        {/* Páginas de ejemplo con Bootstrap */}
        <Route path="dashboard" element={<DashboardBootstrap />} />
      </Route>

      {/* Ruta 404 - Página no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Componente simple de 404
function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold" style={{ color: '#10b981' }}>404</h1>
        <p className="fs-3 text-muted">Página no encontrada</p>
        <a href="/" className="btn btn-success mt-3">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

export default AppBootstrapRoutes;
