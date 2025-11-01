import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Form, InputGroup } from 'react-bootstrap';
import { Search, Moon, Sun } from 'lucide-react';
import Logo from '../images/logo/logo-icon.svg';
import DropdownMessage from './DropdownMessage';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const HeaderBootstrap = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Navbar 
      sticky="top" 
      className="bg-white shadow-sm border-bottom"
      style={{ 
        borderBottom: '1px solid #e5e7eb',
        zIndex: 999 
      }}
    >
      <Container fluid className="px-4 px-md-6">
        {/* Hamburger Button for Mobile - Solo visible en pantallas pequeñas */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="d-lg-none btn btn-link text-dark p-0 me-3"
          style={{ fontSize: '1.5rem' }}
        >
          {sidebarOpen ? (
            <span>✕</span>
          ) : (
            <span>☰</span>
          )}
        </button>

        {/* Logo - Solo visible en móvil */}
        <Navbar.Brand as={Link} to="/" className="d-lg-none">
          <img src={Logo} alt="Logo" height="32" />
        </Navbar.Brand>

        {/* Search Bar - Hidden on mobile */}
        <Form className="d-none d-sm-flex flex-grow-1 me-4" style={{ maxWidth: '400px' }}>
          <InputGroup>
            <InputGroup.Text 
              className="bg-transparent border-end-0"
              style={{ borderColor: '#e5e7eb' }}
            >
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar..."
              className="border-start-0 shadow-none"
              style={{ borderColor: '#e5e7eb' }}
            />
          </InputGroup>
        </Form>

        {/* Right Side Actions */}
        <Nav className="ms-auto d-flex align-items-center gap-2 gap-sm-3">
          {/* Dark Mode Toggle */}
          <Nav.Link 
            onClick={toggleDarkMode}
            className="p-2 rounded-circle d-flex align-items-center justify-content-center position-relative"
            style={{ 
              width: '40px', 
              height: '40px',
              transition: 'all 0.3s ease',
              backgroundColor: darkMode ? '#f3f4f6' : 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#f3f4f6' : 'transparent'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Nav.Link>

          {/* Notifications */}
          <Nav.Link 
            className="p-2 rounded-circle d-flex align-items-center justify-content-center position-relative d-none d-sm-flex"
            style={{ width: '40px', height: '40px' }}
          >
            <DropdownNotification />
          </Nav.Link>

          {/* Messages */}
          <Nav.Link 
            className="p-2 rounded-circle d-flex align-items-center justify-content-center position-relative d-none d-sm-flex"
            style={{ width: '40px', height: '40px' }}
          >
            <DropdownMessage />
          </Nav.Link>

          {/* User Dropdown */}
          <DropdownUser />
        </Nav>
      </Container>
    </Navbar>
  );
};

export default HeaderBootstrap;
