# FairTest Platform - Build Documentation

This document provides a comprehensive explanation of how the FairTest platform is built, with a focus on its security features, architecture, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Features](#security-features)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Database Schema](#database-schema)
7. [Build and Deployment](#build-and-deployment)
8. [Security Best Practices](#security-best-practices)

## Overview

FairTest is a secure exam platform designed to prevent cheating at all stages of the examination process through cryptographic techniques:

- **Pre-Exam Security**: Prevents paper leaks before the exam using AES-256-CBC encryption
- **During-Exam Security**: Ensures secure access during the exam using Shamir's Secret Sharing algorithm
- **Post-Exam Security**: Verifies the authenticity of results after the exam using digital signatures

The platform is built using the MERN stack (MongoDB, Express, React, Node.js) with additional cryptographic libraries.

## Architecture

### System Architecture

FairTest follows a client-server architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  React      │     │  Express    │     │  MongoDB    │
│  Frontend   │◄────►  Backend    │◄────►  Database   │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Frontend**: React application with React Router and Bootstrap for UI
- **Backend**: Express.js REST API with JWT authentication
- **Database**: MongoDB for data storage
- **Security**: Cryptographic operations handled on both client and server sides

### Directory Structure

```
fairtest/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── pages/          # Page components
│       └── services/       # API and utility services
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
└── .env                    # Environment variables
```

## Security Features

### 1. Pre-Exam Security (AES-256-CBC Encryption)

Exam questions and answers are encrypted using AES-256-CBC encryption before being stored in the database:

1. A random encryption key and initialization vector (IV) are generated for each exam
2. Questions, options, and answers are encrypted individually
3. The encryption key is never stored directly in the database
4. Instead, the key is split using Shamir's Secret Sharing

Implementation:
- `server/utils/encryption.js`: Contains encryption/decryption functions
- `server/controllers/examController.js`: Handles the encryption process

### 2. During-Exam Security (Shamir's Secret Sharing)

The encryption key is split into multiple shares using Shamir's Secret Sharing algorithm:

1. The system creates more shares than the threshold (threshold + 3)
2. Only a subset of shares are stored in the database
3. The remaining shares must be distributed to trusted authorities
4. At least the threshold number of shares (default: 2) are required to reconstruct the key

This ensures that no single entity can decrypt the exam without collaboration.

Implementation:
- `server/utils/shamir.js`: Implements Shamir's Secret Sharing
- `server/controllers/examController.js`: Handles key splitting and distribution

### 3. Post-Exam Security (Digital Signatures)

Student submissions are digitally signed to ensure authenticity:

1. Each user receives a keypair (public and private keys) during registration
2. When submitting an exam, the student signs their answers using their private key
3. The signature is verified using the student's public key
4. This prevents unauthorized modifications to submissions

Implementation:
- `server/utils/signature.js`: Handles digital signature operations
- `client/src/services/crypto.js`: Client-side signature generation
- `server/controllers/resultController.js`: Signature verification

## Backend Implementation

### Server Setup

The Express server is configured in `server/server.js`:

```javascript
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exams', require('./routes/exam'));
app.use('/api/results', require('./routes/result'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Authentication

Authentication is implemented using JSON Web Tokens (JWT):

1. Users register with email, password, and role (student, examiner, admin)
2. Passwords are hashed using bcrypt before storage
3. On login, a JWT token is generated and returned to the client
4. Protected routes verify the JWT token using middleware

Implementation:
- `server/controllers/authController.js`: Handles registration, login, and profile
- `server/middleware/auth.js`: JWT verification middleware

### Database Connection

MongoDB connection is configured in `server/config/db.js`:

```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
```

### API Controllers

The main controllers implement the core functionality:

- `authController.js`: User authentication and management
- `examController.js`: Exam creation, retrieval, and decryption
- `resultController.js`: Exam submission, grading, and verification

### Security Utilities

Cryptographic operations are implemented in utility modules:

- `encryption.js`: AES-256-CBC encryption/decryption
- `shamir.js`: Shamir's Secret Sharing algorithm
- `signature.js`: Digital signature generation and verification

## Frontend Implementation

### React Setup

The React application is configured with React Router for navigation and context API for state management:

```javascript
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/exams/create" element={<ExamCreatePage />} />
              <Route path="/exams/:id" element={<ExamDetailPage />} />
              <Route path="/exams/:id/take" element={<ExamTakePage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/results/live/:examId" element={<LiveResultsPage />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
```

### Authentication Context

The `AuthContext` provides authentication state and functions throughout the application:

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  // Authentication functions: register, login, logout
  // ...

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### API Services

API calls are centralized in service modules:

```javascript
// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5001';

// Exams API
export const examAPI = {
  getExams: async () => {
    const { data } = await axios.get('/api/exams');
    return data;
  },
  
  // Other exam-related API calls
  // ...
};

// Results API
export const resultAPI = {
  submitResult: async (resultData) => {
    const { data } = await axios.post('/api/results', resultData);
    return data;
  },
  
  // Other result-related API calls
  // ...
};
```

### Key Pages

- `HomePage.js`: Landing page with information about the platform
- `LoginPage.js` & `RegisterPage.js`: Authentication pages
- `DashboardPage.js`: User dashboard showing available exams and results
- `ExamCreatePage.js`: Form for creating new exams with encryption
- `ExamTakePage.js`: Interface for students to take exams
- `LiveResultsPage.js`: Real-time results display

## Database Schema

### User Model

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'examiner', 'admin'],
    default: 'student'
  },
  publicKey: {
    type: String
  },
  secretKey: {
    type: String
  }
}, {
  timestamps: true
});
```

### Exam Model

```javascript
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
```

### Result Model

```javascript
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
```

## Build and Deployment

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install server dependencies:
   ```
   npm install
   ```
3. Install client dependencies:
   ```
   cd client
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/fairtest
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

### Development

Run the development server (both frontend and backend):
```
npm run dev
```

This uses concurrently to run:
- Backend: `nodemon server/server.js`
- Frontend: `npm start --prefix client`

### Production Build

1. Build the React frontend:
   ```
   cd client
   npm run build
   ```
2. Start the production server:
   ```
   npm start
   ```

## Security Best Practices

### Distributed Key Storage

To prevent exam paper leaks, the system implements distributed key storage:

1. The encryption key is split into multiple shares (threshold + 3)
2. Only a subset of shares are stored in the database
3. The remaining shares must be distributed to trusted authorities
4. At least the threshold number of shares (default: 2) are required to decrypt

This ensures that even if the database is compromised, the attacker cannot decrypt the exam content without obtaining the external key shares.

### Key Distribution Guidelines

When creating an exam, follow these guidelines for key distribution:

1. **Never store all key shares in one place**
2. **Distribute external shares to different trusted authorities**
3. **Ensure each authority understands the importance of securing their share**
4. **Establish a secure protocol for bringing shares together during exam time**

### Audit Logging

The system logs all decryption attempts for security auditing:

```javascript
// Log this decryption event for security audit
console.log(`SECURITY: Exam ${exam._id} decrypted by user ${req.user._id} at ${new Date().toISOString()}`);
```

In a production environment, these logs should be stored in a tamper-proof system.

### Access Control

The system implements role-based access control:

- **Students**: Can only view and take published/active exams
- **Examiners**: Can create, manage, and grade exams
- **Admins**: Have full access to all features

### Digital Signature Verification

All exam submissions are digitally signed and verified:

1. Students sign their submissions using their private key
2. The system verifies the signature using the student's public key
3. This prevents unauthorized modifications to submissions

By following these security practices, FairTest provides a robust platform for conducting secure exams with cryptographic guarantees against cheating at all stages.
