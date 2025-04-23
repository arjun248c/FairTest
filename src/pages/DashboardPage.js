import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch exams
        const examsResponse = await api.get('/api/exams');
        setExams(examsResponse.data);
        
        // Fetch results if user is a student
        if (user && user.role === 'student') {
          const resultsResponse = await api.get('/api/results/student');
          setResults(resultsResponse.data);
        }
        
        setError('');
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge bg="secondary">Draft</Badge>;
      case 'published':
        return <Badge bg="info">Published</Badge>;
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'completed':
        return <Badge bg="dark">Completed</Badge>;
      default:
        return <Badge bg="light">Unknown</Badge>;
    }
  };

  return (
    <div className="my-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {error && <p className="text-danger">{error}</p>}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Available Exams</Card.Header>
            <Card.Body>
              {loading ? (
                <p>Loading exams...</p>
              ) : exams.length === 0 ? (
                <p>No exams available.</p>
              ) : (
                <Row>
                  {exams.map((exam) => (
                    <Col md={6} key={exam._id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <Card.Title>{exam.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            {getStatusBadge(exam.status)}
                          </Card.Subtitle>
                          <Card.Text>{exam.description}</Card.Text>
                          <div className="d-flex justify-content-between">
                            <Link to={`/exams/${exam._id}`}>
                              <Button variant="outline-primary" size="sm">
                                View Details
                              </Button>
                            </Link>
                            
                            {user && user.role === 'student' && exam.status === 'active' ? (
                              <Link to={`/exams/${exam._id}/take`}>
                                <Button variant="success" size="sm">
                                  Take Exam
                                </Button>
                              </Link>
                            ) : null}
                            
                            {exam.status === 'completed' && (
                              <Link to={`/results/live/${exam._id}`}>
                                <Button variant="info" size="sm">
                                  Live Results
                                </Button>
                              </Link>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header as="h5">User Information</Card.Header>
            <Card.Body>
              {user ? (
                <>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </>
              ) : (
                <p>Please <Link to="/login">login</Link> to see your information</p>
              )}

              {user && user.role === 'examiner' && (
                <Link to="/exams/create">
                  <Button variant="primary" className="mt-3">
                    Create New Exam
                  </Button>
                </Link>
              )}
            </Card.Body>
          </Card>
          
          {user && user.role === 'student' && (
            <Card>
              <Card.Header as="h5">Recent Results</Card.Header>
              <ListGroup variant="flush">
                {loading ? (
                  <ListGroup.Item>Loading results...</ListGroup.Item>
                ) : results.length === 0 ? (
                  <ListGroup.Item>No results yet.</ListGroup.Item>
                ) : (
                  results.slice(0, 5).map((result) => (
                    <ListGroup.Item key={result._id}>
                      <p className="mb-1">
                        <strong>{result.exam.title}</strong>
                      </p>
                      <p className="mb-1">
                        Score: {result.score !== undefined ? `${result.score}/${result.maxScore}` : 'Not graded yet'}
                      </p>
                      <small className="text-muted">
                        Submitted: {new Date(result.submittedAt).toLocaleString()}
                      </small>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
