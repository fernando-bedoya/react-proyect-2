import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './satoshi.css';
import './Styles/bootstrap-theme.css';
import './Styles/theme-switcher.css';

// 🔥 Nota: Bootstrap CSS estaba duplicado (línea 6 y 11), se eliminó la duplicación
// 🛡️ Provider de Redux agregado para que todos los componentes (incluyendo SignIn/SignUp) 
// puedan acceder al store global, esto es necesario porque useDispatch() requiere el contexto de Redux

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <App />
        </Router>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
