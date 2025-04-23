import React, { useState } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ExamCreatePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [threshold, setThreshold] = useState(3);
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [keyShares, setKeyShares] = useState([]);
  const [externalShares, setExternalShares] = useState([]);
  const [securityNotice, setSecurityNotice] = useState('');

  const navigate = useNavigate();

  const addQuestionHandler = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const removeQuestionHandler = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestionHandler = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOptionHandler = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate form
    if (!title || !startTime || !endTime || questions.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || q.options.some(opt => !opt) || !q.answer) {
        setError('Please fill in all question fields');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const examData = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        threshold,
        questions
      };

      const result = await examAPI.createExam(examData);

      setSuccess(true);
      setKeyShares(result.keyShares || []);
      setExternalShares(result.externalShares || []);
      setSecurityNotice(result.securityNotice || '');
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to create exam'
      );
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Create New Exam</h1>

      {loading && <Loader />}
      {error && <Message variant="danger">{error}</Message>}

      {success ? (
        <Card>
          <Card.Body>
            <Card.Title className="text-success">Exam Created Successfully!</Card.Title>
            <p>
              Your exam has been created and encrypted. The encryption key has been split
              into multiple shares using Shamir's Secret Sharing algorithm with enhanced security.
            </p>
            <p>
              <strong>Important Security Notice:</strong> You need at least {threshold} key shares
              to decrypt the exam. For maximum security, these shares have been divided into:
            </p>

            <Card className="bg-light p-3 mb-4 border-warning">
              <h5 className="text-danger">⚠️ External Key Shares (CRITICAL)</h5>
              <p className="text-danger">
                These shares must be distributed to separate trusted authorities immediately.
                They should NOT be stored in the same place or given to the same person.
              </p>
              {externalShares.map((share, index) => (
                <div key={index} className="mb-2">
                  <small className="text-muted">External Share {index + 1}:</small>
                  <p className="mb-1 text-break">{share}</p>
                </div>
              ))}
            </Card>

            <Card className="bg-light p-3 mb-4">
              <h5>Database Key Shares:</h5>
              <p className="text-muted">
                These shares are stored in the database but are not enough to decrypt the exam without
                the external shares above.
              </p>
              {keyShares.map((share, index) => (
                <div key={index} className="mb-2">
                  <small className="text-muted">DB Share {index + 1}:</small>
                  <p className="mb-1 text-break">{share}</p>
                </div>
              ))}
            </Card>

            {securityNotice && (
              <Card className="bg-danger text-white p-3 mb-4">
                <h5>⚠️ Security Warning</h5>
                <p>{securityNotice}</p>
              </Card>
            )}

            <div className="d-flex justify-content-between">
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline-primary" onClick={() => {
                setSuccess(false);
                setTitle('');
                setDescription('');
                setStartTime('');
                setEndTime('');
                setThreshold(2);
                setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
                setKeyShares([]);
                setExternalShares([]);
                setSecurityNotice('');
              }}>
                Create Another Exam
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Form onSubmit={submitHandler}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Exam Details</Card.Title>

              <Form.Group controlId="title" className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter exam title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter exam description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="startTime" className="mb-3">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="endTime" className="mb-3">
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="threshold" className="mb-3">
                <Form.Label>Key Threshold (minimum shares needed to decrypt)</Form.Label>
                <Form.Control
                  type="number"
                  min={2}
                  max={5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  required
                />
                <Form.Text className="text-muted">
                  This determines how many key shares are needed to decrypt the exam.
                  A threshold of 2 allows the exam to proceed if one key holder is unavailable.
                  However, this means you must ensure the key shares are stored securely in different locations.
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          <h3 className="mb-3">Questions</h3>

          {questions.map((question, qIndex) => (
            <Card key={qIndex} className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title>Question {qIndex + 1}</Card.Title>
                  {questions.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestionHandler(qIndex)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Form.Group controlId={`question-${qIndex}`} className="mb-3">
                  <Form.Label>Question Text</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter question"
                    value={question.question}
                    onChange={(e) => updateQuestionHandler(qIndex, 'question', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Options</Form.Label>
                  {question.options.map((option, oIndex) => (
                    <Form.Control
                      key={oIndex}
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      className="mb-2"
                      value={option}
                      onChange={(e) => updateOptionHandler(qIndex, oIndex, e.target.value)}
                      required
                    />
                  ))}
                </Form.Group>

                <Form.Group controlId={`answer-${qIndex}`} className="mb-3">
                  <Form.Label>Correct Answer</Form.Label>
                  <Form.Select
                    value={question.answer}
                    onChange={(e) => updateQuestionHandler(qIndex, 'answer', e.target.value)}
                    required
                  >
                    <option value="">Select correct answer</option>
                    {question.options.map((option, oIndex) => (
                      <option key={oIndex} value={option}>
                        {option || `Option ${oIndex + 1}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          ))}

          <div className="mb-4">
            <Button variant="secondary" onClick={addQuestionHandler}>
              Add Question
            </Button>
          </div>

          <div className="d-flex justify-content-between mb-5">
            <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Exam
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default ExamCreatePage;
