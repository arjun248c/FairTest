const Exam = require('../models/Exam');
const { encrypt, decrypt, generateKeyAndIV } = require('../utils/encryption');
const { splitSecret, combineShares } = require('../utils/shamir');

/**
 * Create a new exam
 * @route POST /api/exams
 * @access Private (Examiner only)
 */
const createExam = async (req, res) => {
  try {
    const { title, description, questions, startTime, endTime, threshold } = req.body;

    // Generate encryption key and IV
    const { key, iv } = generateKeyAndIV();

    // Encrypt questions and answers
    const encryptedQuestions = questions.map(q => ({
      encryptedQuestion: encrypt(q.question, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex')),
      encryptedOptions: q.options.map(opt =>
        encrypt(opt, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
      ),
      encryptedAnswer: encrypt(q.answer, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    }));

    // Create key shares using Shamir's Secret Sharing with higher security
    const minThreshold = threshold || 2; // Keep the threshold as specified by the user (default 2)
    const numShares = minThreshold + 3; // Create more shares for better security
    const keyWithIV = JSON.stringify({ key, iv });
    const shares = splitSecret(keyWithIV, numShares, minThreshold);

    // Only store a subset of shares in the database
    // The remaining shares should be distributed to trusted authorities
    const dbShares = shares.slice(0, Math.ceil(minThreshold / 2));
    const externalShares = shares.slice(Math.ceil(minThreshold / 2));

    // Create new exam without storing the encryption key
    const exam = new Exam({
      title,
      description,
      creator: req.user.id,
      questions: encryptedQuestions,
      keyShares: dbShares, // Store only a subset of shares in the database
      threshold: minThreshold,
      startTime,
      endTime,
      status: 'draft'
    });

    await exam.save();

    res.status(201).json({
      id: exam._id,
      title: exam.title,
      description: exam.description,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      // Return external shares that need to be securely distributed
      // These should be stored separately by trusted authorities
      externalShares: externalShares,
      // Important security notice
      securityNotice: "IMPORTANT: These external key shares must be distributed to separate trusted authorities. " +
                     "The exam cannot be decrypted unless the minimum threshold of key shares are combined. " +
                     "For maximum security, no single entity should possess enough shares to reach the threshold."
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all exams
 * @route GET /api/exams
 * @access Private
 */
const getExams = async (req, res) => {
  try {
    let query = {};

    // If user is a student, only show published or active exams
    if (req.user.role === 'student') {
      query.status = { $in: ['published', 'active'] };
    }
    // If user is an examiner, only show their exams
    else if (req.user.role === 'examiner') {
      query.creator = req.user.id;
    }

    const exams = await Exam.find(query)
      .select('-questions -encryptionKey -keyShares')
      .populate('creator', 'name email');

    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get exam by ID
 * @route GET /api/exams/:id
 * @access Private
 */
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('creator', 'name email');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user has access to this exam
    if (req.user.role === 'student' && !['published', 'active'].includes(exam.status)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'examiner' && exam.creator._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For students, don't send encrypted answers
    if (req.user.role === 'student') {
      const studentExam = {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        creator: exam.creator,
        startTime: exam.startTime,
        endTime: exam.endTime,
        status: exam.status,
        questions: exam.questions.map(q => ({
          _id: q._id,
          encryptedQuestion: q.encryptedQuestion,
          encryptedOptions: q.encryptedOptions
        }))
      };
      return res.json(studentExam);
    }

    res.json(exam);
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update exam status
 * @route PUT /api/exams/:id/status
 * @access Private (Examiner only)
 */
const updateExamStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['draft', 'published', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator of the exam
    if (exam.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    exam.status = status;
    await exam.save();

    res.json({ id: exam._id, status: exam.status });
  } catch (error) {
    console.error('Update exam status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Decrypt exam with key shares
 * @route POST /api/exams/:id/decrypt
 * @access Private
 */
const decryptExam = async (req, res) => {
  try {
    const { keyShares } = req.body;

    // First get the exam to check the threshold
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Verify that enough key shares are provided
    if (!keyShares || !Array.isArray(keyShares) || keyShares.length < exam.threshold) {
      return res.status(400).json({ message: `At least ${exam.threshold} key shares are required` });
    }

    // Access control check
    if (req.user.role === 'student' && exam.status !== 'active') {
      return res.status(403).json({ message: 'Access denied: Exam is not active' });
    }

    // Combine key shares to get the original key
    try {
      const recoveredKeyWithIV = combineShares(keyShares);
      const { key, iv } = JSON.parse(recoveredKeyWithIV);

      // Decrypt questions and options
      const decryptedQuestions = exam.questions.map(q => ({
        question: decrypt(q.encryptedQuestion, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex')),
        options: q.encryptedOptions.map(opt =>
          decrypt(opt, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
        ),
        answer: decrypt(q.encryptedAnswer, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
      }));

      // Log this decryption event for security audit
      console.log(`SECURITY: Exam ${exam._id} decrypted by user ${req.user._id} at ${new Date().toISOString()}`);

      // In a production environment, you would want to store this in a secure audit log
      // that cannot be tampered with

      res.json({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        questions: decryptedQuestions,
        decryptedAt: new Date().toISOString(),
        decryptedBy: req.user._id
      });
    } catch (error) {
      console.error('Decryption error:', error);
      res.status(400).json({ message: 'Invalid key shares or decryption failed' });
    }
  } catch (error) {
    console.error('Decrypt exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExamStatus,
  decryptExam
};
