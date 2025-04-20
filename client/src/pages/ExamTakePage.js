import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, resultAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { signMessage } from '../services/crypto';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ExamTakePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [keyShares, setKeyShares] = useState(['', '']);
  const [decryptedExam, setDecryptedExam] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examSubmitted, setExamSubmitted] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const examData = await examAPI.getExamById(id);
        
        // Check if exam is active
        if (examData.status !== 'active') {
          setError('This exam is not currently active');
          setLoading(false);
          return;
        }
        
        setExam(examData);
        
        // Calculate time remaining
        const endTime = new Date(examData.endTime).getTime();
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
          setError('This exam has ended');
          setLoading(false);
          return;
        }
        
        setTimeRemaining(Math.floor(timeLeft / 1000));
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
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Time is up! The exam has ended.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      
      // Initialize selected answers
      const initialAnswers = {};
      decryptedData.questions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setSelectedAnswers(initialAnswers);
      
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

  const addKeyShareField = () => {
    setKeyShares([...keyShares, '']);
  };

  const updateKeyShare = (index, value) => {
    const newKeyShares = [...keyShares];
    newKeyShares[index] = value;
    setKeyShares(newKeyShares);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const submitExamHandler = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if all questions are answered
      const unansweredQuestions = Object.values(selectedAnswers).filter(answer => !answer).length;
      
      if (unansweredQuestions > 0) {
        if (!window.confirm(`You have ${unansweredQuestions} unanswered questions. Are you sure you want to submit?`)) {
          setLoading(false);
          return;
        }
      }
      
      // Format answers for submission
      const formattedAnswers = Object.entries(selectedAnswers).map(([questionIndex, selectedOption]) => ({
        questionIndex: parseInt(questionIndex),
        selectedOption
      }));
      
      // Get secret key from local storage
      const secretKey = localStorage.getItem('secretKey');
      
      if (!secretKey) {
        setError('Secret key not found. Please register again or contact support.');
        setLoading(false);
        return;
      }
      
      // Create data to sign
      const dataToSign = {
        examId: id,
        answers: formattedAnswers,
        studentId: user.id
      };
      
      // Sign the data
      const signature = signMessage(dataToSign, secretKey);
      
      // Submit the result
      await resultAPI.submitResult({
        examId: id,
        answers: formattedAnswers,
        signature
      });
      
      setExamSubmitted(true);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to submit exam'
      );
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!exam) return <Message>Exam not found</Message>;

  if (examSubmitted) {
    return (
      <Container className="my-5">
        <Card>
          <Card.Body className="text-center">
            <h2 className="text-success mb-4">Exam Submitted Successfully!</h2>
            <p>Your answers have been recorded and digitally signed.</p>
            <p>The examiner will grade your submission once the exam period ends.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="mt-3"
            >
              Return to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4">{exam.title}</h1>
      
      {timeRemaining > 0 && (
        <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <span>Time Remaining: {formatTime(timeRemaining)}</span>
        </Alert>
      )}
      
      {!decryptedExam ? (
        <Card className="mb-4">
          <Card.Header>
            <h3>Decrypt Exam</h3>
          </Card.Header>
          <Card.Body>
            <p>
              Enter at least {exam.threshold} key shares to decrypt the exam content.
              These shares will be provided by your exam proctor.
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
                Start Exam
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <h3 className="mb-4">Answer all questions</h3>
              
              {decryptedExam.questions.map((q, qIndex) => (
                <Card key={qIndex} className="mb-4">
                  <Card.Body>
                    <h5>Question {qIndex + 1}: {q.question}</h5>
                    
                    <Form.Group controlId={`question-${qIndex}`}>
                      {q.options.map((option, oIndex) => (
                        <Form.Check
                          key={oIndex}
                          type="radio"
                          id={`q${qIndex}-opt${oIndex}`}
                          label={option}
                          name={`question-${qIndex}`}
                          checked={selectedAnswers[qIndex] === option}
                          onChange={() => handleAnswerChange(qIndex, option)}
                          className="mb-2"
                        />
                      ))}
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}
              
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button variant="success" onClick={submitExamHandler}>
                  Submit Exam
                </Button>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ExamTakePage;
