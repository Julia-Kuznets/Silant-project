import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      window.location.href = '/';
  };
  return (
    <header>
      <Navbar bg="light" expand="lg" className="py-3">
        <Container>
            <Row className="w-100 align-items-center">
                <Col xs={4} md={3}>
                    <Link to="/" className="text-decoration-none">
                        <div style={{ color: 'var(--color-blue)', fontWeight: 'bold', fontSize: '24px' }}>
                           <span style={{ color: 'var(--color-red)' }}>С</span>ИЛАНТ
                        </div>
                    </Link>
                </Col>

                <Col xs={4} md={6} className="text-center">
                    <div style={{ color: 'var(--color-blue)', fontWeight: 'bold' }}>+7-8352-20-12-09</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>telegram: @silant_service</div>
                </Col>

                <Col xs={4} md={3} className="text-end">
                    {isAuthenticated ? (
                        <Button
                            variant="outline-danger"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button
                                variant="outline-primary"
                                style={{ color: 'var(--color-blue)', borderColor: 'var(--color-blue)' }}
                            >
                                Авторизация
                            </Button>
                        </Link>
                    )}
                </Col>
            </Row>
        </Container>
      </Navbar>

      <div className="py-2 text-center text-white" style={{ backgroundColor: 'var(--color-blue)' }}>
        <Container>
            <h4 className="m-0" style={{ fontSize: '1.2rem', color: '#fff' }}>
                Электронная сервисная книжка "Мой Силант"
            </h4>
        </Container>
      </div>
    </header>
  );
};

export default Header;