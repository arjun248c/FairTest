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
const { auth, examiner, admin } = require('../middleware/auth');

// @route   POST /api/results
// @desc    Submit exam result
// @access  Private (Student only)
router.post('/', auth, submitResult);

// @route   POST /api/results/:id/grade
// @desc    Grade exam results
// @access  Private (Examiner only)
router.post('/:id/grade', auth, examiner, gradeResult);

// @route   GET /api/results/exam/:examId
// @desc    Get results for an exam
// @access  Private (Examiner only)
router.get('/exam/:examId', auth, examiner, getExamResults);

// @route   GET /api/results/student
// @desc    Get student's results
// @access  Private
router.get('/student', auth, getStudentResults);

// @route   POST /api/results/:id/verify
// @desc    Verify result signature
// @access  Private (Admin only)
router.post('/:id/verify', auth, admin, verifyResult);

// @route   GET /api/results/live/:examId
// @desc    Get live exam results
// @access  Public
router.get('/live/:examId', getLiveResults);

module.exports = router;
