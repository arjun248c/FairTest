import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="justify-content-md-center my-5">
        <Col md={8} className="text-center">
          <h1>Welcome to FairTest</h1>
          <p className="lead">
            A secure exam platform with cryptographic features to prevent cheating at all stages
          </p>
          {!user && (
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login">
                <Button variant="primary">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline-primary">Register</Button>
              </Link>
            </div>
          )}
        </Col>
      </Row>

      <Row className="my-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Pre-Exam Security</Card.Title>
              <Card.Text>
                Prevents paper leaks before the exam using AES-256-CBC encryption. All exam content is encrypted and can only be decrypted with proper authorization.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>During-Exam Security</Card.Title>
              <Card.Text>
                Ensures secure access during the exam using Shamir's Secret Sharing algorithm. Multiple authorized parties must collaborate to decrypt exam content.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Post-Exam Security</Card.Title>
              <Card.Text>
                Verifies the authenticity of results after the exam using digital signatures. Prevents unauthorized modifications to marks and rankings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {user && (
        <Row className="my-5 text-center">
          <Col>
            <Link to="/dashboard">
              <Button variant="success" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default HomePage;
