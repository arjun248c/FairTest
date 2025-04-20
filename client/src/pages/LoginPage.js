import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <Row className="justify-content-md-center my-5">
      <Col md={6}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Sign In</h2>
            
            {(error || localError) && (
              <Message variant="danger">{error || localError}</Message>
            )}
            
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 mt-3">
                Sign In
              </Button>
            </Form>

            <Row className="py-3">
              <Col>
                New User?{' '}
                <Link to="/register">Register</Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
