import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, resultAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ExamDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [keyShares, setKeyShares] = useState(['', '']);
  const [decryptedExam, setDecryptedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const examData = await examAPI.getExamById(id);
        setExam(examData);

        // If user is examiner, fetch results
        if (user.role === 'examiner' || user.role === 'admin') {
          try {
            const resultsData = await resultAPI.getExamResults(id);
            setResults(resultsData);
          } catch (error) {
            console.error('Failed to fetch results:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load exam'
        );
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, user.role]);

  const updateStatusHandler = async () => {
    try {
      setLoading(true);
      await examAPI.updateExamStatus(id, statusUpdate);

      // Refresh exam data
      const examData = await examAPI.getExamById(id);
      setExam(examData);

      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update status'
      );
      setLoading(false);
    }
  };

  const decryptExamHandler = async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty key shares
      const validKeyShares = keyShares.filter(share => share.trim() !== '');

      if (validKeyShares.length < 2) {
        setError('At least 2 key shares are required');
        setLoading(false);
        return;
      }

      const decryptedData = await examAPI.decryptExam(id, validKeyShares);
      setDecryptedExam(decryptedData);

      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to decrypt exam'
      );
      setLoading(false);
    }
  };

  const gradeResultHandler = async (resultId) => {
    try {
      setLoading(true);

      // Filter out empty key shares
      const validKeyShares = keyShares.filter(share => share.trim() !== '');

      if (validKeyShares.length < 2) {
        setError('At least 2 key shares are required');
        setLoading(false);
        return;
      }

      await resultAPI.gradeResult(resultId, validKeyShares);

      // Refresh results
      const resultsData = await resultAPI.getExamResults(id);
      setResults(resultsData);

      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to grade result'
      );
      setLoading(false);
    }
  };

  const addKeyShareField = () => {
    setKeyShares([...keyShares, '']);
  };

  const updateKeyShare = (index, value) => {
    const newKeyShares = [...keyShares];
    newKeyShares[index] = value;
    setKeyShares(newKeyShares);
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!exam) return <Message>Exam not found</Message>;

  return (
    <Container>
      <h1 className="my-4">{exam.title}</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <p><strong>Description:</strong> {exam.description}</p>
              <p><strong>Start Time:</strong> {new Date(exam.startTime).toLocaleString()}</p>
              <p><strong>End Time:</strong> {new Date(exam.endTime).toLocaleString()}</p>
              <p><strong>Status:</strong> {exam.status}</p>
              <p><strong>Created By:</strong> {exam.creator?.name}</p>
            </Col>

            <Col md={4}>
              {(user.role === 'examiner' || user.role === 'admin') && (
                <div className="mb-3">
                  <Form.Group controlId="statusUpdate" className="mb-2">
                    <Form.Label>Update Status</Form.Label>
                    <Form.Select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                    >
                      <option value="">Select status</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>

                  <Button
                    variant="primary"
                    onClick={updateStatusHandler}
                    disabled={!statusUpdate}
                    className="w-100"
                  >
                    Update Status
                  </Button>
                </div>
              )}

              {user.role === 'student' && exam.status === 'active' && (
                <Button
                  variant="success"
                  onClick={() => navigate(`/exams/${exam._id}/take`)}
                  className="w-100 mb-3"
                >
                  Take Exam
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Key Shares Section */}
      <Card className="mb-4">
        <Card.Header>
          <h3>Decrypt Exam</h3>
        </Card.Header>
        <Card.Body>
          <p>
            Enter at least {exam.threshold} key shares to decrypt the exam content.
            These shares were distributed when the exam was created.
          </p>

          {keyShares.map((share, index) => (
            <Form.Group key={index} controlId={`keyShare-${index}`} className="mb-3">
              <Form.Label>Key Share {index + 1}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={share}
                onChange={(e) => updateKeyShare(index, e.target.value)}
                placeholder="Enter key share"
              />
            </Form.Group>
          ))}

          <div className="d-flex justify-content-between mb-3">
            <Button variant="secondary" onClick={addKeyShareField}>
              Add Another Key Share
            </Button>
            <Button variant="primary" onClick={decryptExamHandler}>
              Decrypt Exam
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Decrypted Exam Content */}
      {decryptedExam && (
        <Card className="mb-4">
          <Card.Header>
            <h3>Decrypted Exam Content</h3>
          </Card.Header>
          <Card.Body>
            {decryptedExam.questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-4">
                <h5>Question {qIndex + 1}: {q.question}</h5>
                <ol type="A">
                  {q.options.map((option, oIndex) => (
                    <li key={oIndex} className={option === q.answer ? 'text-success fw-bold' : ''}>
                      {option} {option === q.answer && '(Correct Answer)'}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Results Section for Examiners */}
      {(user.role === 'examiner' || user.role === 'admin') && (
        <Card className="mb-4">
          <Card.Header>
            <h3>Exam Results</h3>
          </Card.Header>
          <Card.Body>
            {results.length === 0 ? (
              <Message>No results submitted yet</Message>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted At</th>
                    <th>Score</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result._id}>
                      <td>{result.student.name}</td>
                      <td>{new Date(result.submittedAt).toLocaleString()}</td>
                      <td>
                        {result.score !== undefined ? (
                          `${result.score}/${result.maxScore}`
                        ) : (
                          'Not graded'
                        )}
                      </td>
                      <td>
                        {result.verificationStatus ? (
                          <span className="text-success">Verified</span>
                        ) : (
                          <span className="text-danger">Not verified</span>
                        )}
                      </td>
                      <td>
                        {result.score === undefined && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => gradeResultHandler(result._id)}
                          >
                            Grade
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between mb-5">
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/results/live/${exam._id}`)}
        >
          View Live Results
        </Button>
      </div>
    </Container>
  );
};

export default ExamDetailPage;
