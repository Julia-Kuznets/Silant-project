import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="mt-auto py-3 bg-light border-top">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-start">
             <span className="text-muted">+7-8352-20-12-09, telegram</span>
          </Col>
          <Col md={6} className="text-end">
             <span style={{ color: 'var(--color-blue)' }}>Мой Силант 2022</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;