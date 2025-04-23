const express = require('express');
const router = express.Router();
const { 
  submitResult, 
  gradeResult, 
  getExamResults, 
  getStudentResults, 
  verifyResult,
  getLiveResults
} = require('../controllers/resultController');
const { protect, examiner, student, admin } = require('../middleware/auth');

// Submit exam result
router.post('/', protect, student, submitResult);

// Grade exam result
router.post('/:id/grade', protect, examiner, gradeResult);

// Get results for an exam
router.get('/exam/:examId', protect, examiner, getExamResults);

// Get student's results
router.get('/student', protect, getStudentResults);

// Verify result signature
router.post('/:id/verify', protect, admin, verifyResult);

// Get live exam results
router.get('/live/:examId', getLiveResults);

module.exports = router;
