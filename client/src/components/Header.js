import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">FairTest</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  {(user.role === 'examiner' || user.role === 'admin') && (
                    <Nav.Link as={Link} to="/exams/create">Create Exam</Nav.Link>
                  )}
                  <NavDropdown title={user.name} id="username">
                    <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/results">Results</NavDropdown.Item>
                    <NavDropdown.Item onClick={logout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">
                    <i className="fas fa-user"></i> Sign In
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register">
                    <i className="fas fa-user-plus"></i> Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
