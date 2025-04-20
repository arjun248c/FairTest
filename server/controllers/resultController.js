const Result = require('../models/Result');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { signMessage, verifySignature } = require('../utils/signature');
const { decrypt } = require('../utils/encryption');
const { combineShares } = require('../utils/shamir');

/**
 * Submit exam result
 * @route POST /api/results
 * @access Private (Student only)
 */
const submitResult = async (req, res) => {
  try {
    const { examId, answers, signature } = req.body;

    // Validate input
    if (!examId || !answers || !Array.isArray(answers) || !signature) {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    // Check if exam exists and is active
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.status !== 'active') {
      return res.status(400).json({ message: 'Exam is not active' });
    }

    // Check if student has already submitted
    const existingResult = await Result.findOne({
      exam: examId,
      student: req.user.id
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    // Verify signature
    const user = await User.findById(req.user.id);
    const dataToVerify = JSON.stringify({ examId, answers, studentId: req.user.id });

    if (!verifySignature(dataToVerify, signature, user.publicKey)) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Create new result
    const result = new Result({
      exam: examId,
      student: req.user.id,
      answers,
      maxScore: exam.questions.length,
      signature,
      verificationStatus: true
    });

    await result.save();

    res.status(201).json({
      id: result._id,
      examId: result.exam,
      submittedAt: result.submittedAt
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Grade exam results
 * @route POST /api/results/:id/grade
 * @access Private (Examiner only)
 */
const gradeResult = async (req, res) => {
  try {
    const { keyShares } = req.body;

    if (!keyShares || !Array.isArray(keyShares) || keyShares.length < 2) {
      return res.status(400).json({ message: 'At least 2 key shares are required' });
    }

    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const exam = await Exam.findById(result.exam);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator of the exam
    if (exam.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Combine key shares to get the original key
    try {
      const recoveredKeyWithIV = combineShares(keyShares);
      const { key, iv } = JSON.parse(recoveredKeyWithIV);

      // Calculate score
      let score = 0;

      for (const answer of result.answers) {
        const question = exam.questions[answer.questionIndex];
        if (!question) continue;

        const correctAnswer = decrypt(question.encryptedAnswer, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

        if (answer.selectedOption === correctAnswer) {
          score++;
        }
      }

      // Update result
      result.score = score;
      await result.save();

      res.json({
        id: result._id,
        score: result.score,
        maxScore: result.maxScore
      });
    } catch (error) {
      console.error('Decryption error:', error);
      res.status(400).json({ message: 'Invalid key shares or decryption failed' });
    }
  } catch (error) {
    console.error('Grade result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get results for an exam
 * @route GET /api/results/exam/:examId
 * @access Private (Examiner only)
 */
const getExamResults = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator of the exam
    if (exam.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'name email');

    res.json(results);
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get student's results
 * @route GET /api/results/student
 * @access Private
 */
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('exam', 'title description');

    res.json(results);
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify result signature
 * @route POST /api/results/:id/verify
 * @access Private (Admin only)
 */
const verifyResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'publicKey')
      .populate('exam');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const dataToVerify = JSON.stringify({
      examId: result.exam._id,
      answers: result.answers,
      studentId: result.student._id
    });

    const isValid = verifySignature(
      dataToVerify,
      result.signature,
      result.student.publicKey
    );

    result.verificationStatus = isValid;
    await result.save();

    res.json({
      id: result._id,
      verificationStatus: result.verificationStatus
    });
  } catch (error) {
    console.error('Verify result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get live exam results
 * @route GET /api/results/live/:examId
 * @access Public
 */
const getLiveResults = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Get all results for this exam
    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort('-submittedAt');

    // Calculate statistics
    const totalSubmissions = results.length;
    const gradedSubmissions = results.filter(r => r.score !== undefined).length;

    let averageScore = 0;
    let highestScore = 0;

    if (gradedSubmissions > 0) {
      const totalScore = results.reduce((sum, result) => {
        if (result.score !== undefined) {
          highestScore = Math.max(highestScore, result.score);
          return sum + result.score;
        }
        return sum;
      }, 0);

      averageScore = totalScore / gradedSubmissions;
    }

    // Format the response
    const formattedResults = results.map(result => ({
      id: result._id,
      studentName: result.student.name,
      studentEmail: result.student.email,
      submittedAt: result.submittedAt,
      score: result.score,
      maxScore: result.maxScore,
      verificationStatus: result.verificationStatus
    }));

    res.json({
      examId: exam._id,
      examTitle: exam.title,
      statistics: {
        totalSubmissions,
        gradedSubmissions,
        averageScore,
        highestScore
      },
      results: formattedResults
    });
  } catch (error) {
    console.error('Get live results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitResult,
  gradeResult,
  getExamResults,
  getStudentResults,
  verifyResult,
  getLiveResults
};
