import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBook, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/students', label: 'Students', icon: <FaUsers /> },
    { path: '/courses', label: 'Courses', icon: <FaBook /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'show' : ''}`} style={{ width: '250px', minWidth: '250px' }}>
        <div className="p-3">
          <h4 className="text-white mb-4">Student Management</h4>
          <Nav className="flex-column">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                href={item.path}
                className={isActive(item.path) ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <Navbar bg="white" expand="lg" className="shadow-sm">
          <Container fluid>
            <Button
              variant="link"
              className="d-lg-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </Button>
            
            <Navbar.Brand className="ms-2">Student Management System</Navbar.Brand>
            
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
              <Nav className="ms-auto">
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-muted me-2">Welcome,</span>
                  <span className="fw-bold">{user?.firstName} {user?.lastName}</span>
                </Nav.Item>
                <Nav.Item>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleLogout}
                    className="d-flex align-items-center"
                  >
                    <FaSignOutAlt className="me-1" />
                    Logout
                  </Button>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page Content */}
        <div className="main-content flex-grow-1">
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 