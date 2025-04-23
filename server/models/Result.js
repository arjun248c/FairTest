const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: true
      },
      selectedOption: {
        type: String,
        required: true
      }
    }
  ],
  score: {
    type: Number
  },
  maxScore: {
    type: Number,
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
