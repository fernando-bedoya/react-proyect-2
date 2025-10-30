import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './satoshi.css';
import './Styles/bootstrap-theme.css';
import './Styles/theme-switcher.css';
import 'bootstrap/dist/css/bootstrap.min.css';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
