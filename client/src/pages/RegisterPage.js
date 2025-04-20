import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [localError, setLocalError] = useState(null);
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      const data = await register(name, email, password, role);
      
      // Alert user to save their secret key
      if (data.secretKey) {
        alert(
          'IMPORTANT: Your secret key has been saved to your browser. ' +
          'This key is used for signing your exam submissions. ' +
          'If you clear your browser data, you will lose this key and ' +
          'will not be able to submit exams. Please keep a backup of this key.'
        );
      }
      
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
            <h2 className="text-center mb-4">Register</h2>
            
            {(error || localError) && (
              <Message variant="danger">{error || localError}</Message>
            )}
            
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

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

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="role" className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="examiner">Examiner</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 mt-3">
                Register
              </Button>
            </Form>

            <Row className="py-3">
              <Col>
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;
