const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getExams, 
  getExamById, 
  updateExamStatus, 
  decryptExam 
} = require('../controllers/examController');
const { protect, examiner } = require('../middleware/auth');

// Get all exams
router.get('/', protect, getExams);

// Get exam by ID
router.get('/:id', protect, getExamById);

// Create a new exam
router.post('/', protect, examiner, createExam);

// Update exam status
router.put('/:id/status', protect, examiner, updateExamStatus);

// Decrypt exam with key shares
router.post('/:id/decrypt', protect, decryptExam);

module.exports = router;
