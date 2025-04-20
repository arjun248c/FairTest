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
            A secure platform for conducting exams with cryptographic protection
            against cheating at all stages.
          </p>
          {!user && (
            <div className="d-flex justify-content-center">
              <Link to="/login">
                <Button variant="primary" className="mx-2">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline-primary" className="mx-2">
                  Register
                </Button>
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
                Exam questions and answers are encrypted using AES-256-CBC to prevent
                paper leaks before the exam.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>During Exam Security</Card.Title>
              <Card.Text>
                Shamir's Secret Sharing algorithm ensures that multiple authorized
                parties must collaborate to decrypt exam content.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Post-Exam Security</Card.Title>
              <Card.Text>
                Digital signatures verify the authenticity of exam results,
                preventing unauthorized modifications to marks and rankings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
