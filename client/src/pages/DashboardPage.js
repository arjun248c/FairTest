import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examAPI, resultAPI } from '../services/api';
import Message from '../components/Message';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch exams
        const examsData = await examAPI.getExams();
        setExams(examsData);

        // Fetch results if user is a student
        if (user && user.role === 'student') {
          const resultsData = await resultAPI.getStudentResults();
          setResults(resultsData);
        }

        setLoading(false);
      } catch (error) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <Container>
      <h1 className="my-4">Dashboard</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h3>Available Exams</h3>
                </Card.Header>
                <Card.Body>
                  {exams.length === 0 ? (
                    <Message>No exams available</Message>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam) => (
                          <tr key={exam._id}>
                            <td>{exam.title}</td>
                            <td>{exam.status}</td>
                            <td>{new Date(exam.startTime).toLocaleString()}</td>
                            <td>{new Date(exam.endTime).toLocaleString()}</td>
                            <td>
                              <div>
                                {user && user.role === 'student' && exam.status === 'active' ? (
                                  <Link to={`/exams/${exam._id}/take`}>
                                    <Button variant="primary" size="sm" className="me-1">
                                      Take Exam
                                    </Button>
                                  </Link>
                                ) : (
                                  <Link to={`/exams/${exam._id}`}>
                                    <Button variant="info" size="sm" className="me-1">
                                      View
                                    </Button>
                                  </Link>
                                )}
                                <Link to={`/results/live/${exam._id}`}>
                                  <Button variant="outline-success" size="sm">
                                    Live Results
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Header>
                  <h3>User Information</h3>
                </Card.Header>
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
                      <Button variant="success" className="w-100 mt-3">
                        Create New Exam
                      </Button>
                    </Link>
                  )}
                </Card.Body>
              </Card>

              {user && user.role === 'student' && (
                <Card className="mt-4">
                  <Card.Header>
                    <h3>Recent Results</h3>
                  </Card.Header>
                  <Card.Body>
                    {results.length === 0 ? (
                      <Message>No results yet</Message>
                    ) : (
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Exam</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.slice(0, 5).map((result) => (
                            <tr key={result._id}>
                              <td>{result.exam.title}</td>
                              <td>
                                {result.score}/{result.maxScore}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}

                    <Link to="/results">
                      <Button variant="outline-primary" className="w-100 mt-3">
                        View All Results
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
