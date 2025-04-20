const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getExams, 
  getExamById, 
  updateExamStatus, 
  decryptExam 
} = require('../controllers/examController');
const { auth, examiner } = require('../middleware/auth');

// @route   POST /api/exams
// @desc    Create a new exam
// @access  Private (Examiner only)
router.post('/', auth, examiner, createExam);

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', auth, getExams);

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Private
router.get('/:id', auth, getExamById);

// @route   PUT /api/exams/:id/status
// @desc    Update exam status
// @access  Private (Examiner only)
router.put('/:id/status', auth, examiner, updateExamStatus);

// @route   POST /api/exams/:id/decrypt
// @desc    Decrypt exam with key shares
// @access  Private
router.post('/:id/decrypt', auth, decryptExam);

module.exports = router;
