const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  encryptedQuestion: {
    type: String,
    required: true
  },
  encryptedOptions: [{
    type: String,
    required: true
  }],
  encryptedAnswer: {
    type: String,
    required: true
  }
});

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [QuestionSchema],
  encryptionKey: {
    type: String,
    required: true
  },
  keyShares: [{
    type: String
  }],
  threshold: {
    type: Number,
    default: 2
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exam', ExamSchema);
