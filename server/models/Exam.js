const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [
    {
      encryptedQuestion: {
        type: String,
        required: true
      },
      encryptedOptions: [String],
      encryptedAnswer: {
        type: String,
        required: true
      }
    }
  ],
  // Removed direct storage of encryption key for security
  keyShares: [String],
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
  }
}, {
  timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
