import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Row, Col, Badge, Alert, Button, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { resultAPI, examAPI } from '../services/api';
import Message from '../components/Message';
import Loader from '../components/Loader';

const LiveResultsPage = () => {
  const { examId } = useParams();
  const [results, setResults] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Fetch exam details
      if (!exam) {
        const examData = await examAPI.getExamById(examId);
        setExam(examData);
      }
      
      // Fetch live results
      const resultsData = await resultAPI.getLiveResults(examId);
      setResults(resultsData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to load results'
      );
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchResults();
  }, [examId]);

  // Set up polling for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResults();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval, examId]);

  const handleRefreshChange = (seconds) => {
    setRefreshInterval(seconds);
  };

  if (loading && !results) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!results) return <Message>No results found</Message>;

  const { statistics, results: examResults } = results;

  return (
    <Container>
      <h1 className="my-4">Live Exam Results</h1>
      <h2>{results.examTitle}</h2>
      
      {lastUpdated && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <div>
            <span className="me-2">Auto-refresh: </span>
            <Button 
              variant={refreshInterval === 5 ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-1"
              onClick={() => handleRefreshChange(5)}
            >
              5s
            </Button>
            <Button 
              variant={refreshInterval === 10 ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-1"
              onClick={() => handleRefreshChange(10)}
            >
              10s
            </Button>
            <Button 
              variant={refreshInterval === 30 ? "primary" : "outline-primary"} 
              size="sm" 
              className="me-1"
              onClick={() => handleRefreshChange(30)}
            >
              30s
            </Button>
            <Button 
              variant="success" 
              size="sm" 
              className="ms-2"
              onClick={fetchResults}
            >
              Refresh Now
            </Button>
          </div>
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{statistics.totalSubmissions}</h3>
              <p className="mb-0">Total Submissions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{statistics.gradedSubmissions}</h3>
              <p className="mb-0">Graded Submissions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{statistics.averageScore.toFixed(1)}</h3>
              <p className="mb-0">Average Score</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{statistics.highestScore}</h3>
              <p className="mb-0">Highest Score</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {statistics.totalSubmissions > 0 && statistics.gradedSubmissions > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <h4>Grading Progress</h4>
            <ProgressBar 
              now={(statistics.gradedSubmissions / statistics.totalSubmissions) * 100} 
              label={`${statistics.gradedSubmissions}/${statistics.totalSubmissions} (${Math.round((statistics.gradedSubmissions / statistics.totalSubmissions) * 100)}%)`}
              variant="success"
              className="mb-3"
            />
          </Card.Body>
        </Card>
      )}
      
      <Card>
        <Card.Header>
          <h3>Submissions</h3>
        </Card.Header>
        <Card.Body>
          {examResults.length === 0 ? (
            <Message>No submissions yet</Message>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.studentName}</td>
                    <td>{new Date(result.submittedAt).toLocaleString()}</td>
                    <td>
                      {result.score !== undefined ? (
                        `${result.score}/${result.maxScore} (${Math.round((result.score / result.maxScore) * 100)}%)`
                      ) : (
                        'Not graded yet'
                      )}
                    </td>
                    <td>
                      {result.verificationStatus ? (
                        <Badge bg="success">Verified</Badge>
                      ) : (
                        <Badge bg="warning">Pending Verification</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      <div className="d-flex justify-content-between my-4">
        <Link to="/dashboard">
          <Button variant="secondary">Back to Dashboard</Button>
        </Link>
      </div>
    </Container>
  );
};

export default LiveResultsPage;
