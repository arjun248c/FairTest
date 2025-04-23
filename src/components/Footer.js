import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>FairTest &copy; {new Date().getFullYear()} - Secure Exam Platform</p>
            <p>
              <small>
                Featuring AES-256-CBC encryption, Shamir's Secret Sharing, and Digital Signatures
              </small>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
