import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Badge } from 'react-bootstrap';
import { resultAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Get student's results
        const resultsData = await resultAPI.getStudentResults();
        setResults(resultsData);
        
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
    
    fetchResults();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <Container>
      <h1 className="my-4">My Results</h1>
      
      {results.length === 0 ? (
        <Message>You haven't taken any exams yet</Message>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id}>
                    <td>{result.exam.title}</td>
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
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ResultsPage;
