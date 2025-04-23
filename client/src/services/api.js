import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5001';

// Exams API
export const examAPI = {
  // Get all exams
  getExams: async () => {
    const { data } = await axios.get('/api/exams');
    return data;
  },

  // Get exam by ID
  getExamById: async (id) => {
    const { data } = await axios.get(`/api/exams/${id}`);
    return data;
  },

  // Create new exam
  createExam: async (examData) => {
    const { data } = await axios.post('/api/exams', examData);
    return data;
  },

  // Update exam status
  updateExamStatus: async (id, status) => {
    const { data } = await axios.put(`/api/exams/${id}/status`, { status });
    return data;
  },

  // Decrypt exam with key shares
  decryptExam: async (id, keyShares) => {
    const { data } = await axios.post(`/api/exams/${id}/decrypt`, { keyShares });
    return data;
  }
};

// Results API
export const resultAPI = {
  // Submit exam result
  submitResult: async (resultData) => {
    const { data } = await axios.post('/api/results', resultData);
    return data;
  },

  // Grade exam result
  gradeResult: async (id, keyShares) => {
    const { data } = await axios.post(`/api/results/${id}/grade`, { keyShares });
    return data;
  },

  // Get results for an exam
  getExamResults: async (examId) => {
    const { data } = await axios.get(`/api/results/exam/${examId}`);
    return data;
  },

  // Get student's results
  getStudentResults: async () => {
    const { data } = await axios.get('/api/results/student');
    return data;
  },

  // Verify result signature
  verifyResult: async (id) => {
    const { data } = await axios.post(`/api/results/${id}/verify`);
    return data;
  },

  // Get live exam results
  getLiveResults: async (examId) => {
    const { data } = await axios.get(`/api/results/live/${examId}`);
    return data;
  }
};
