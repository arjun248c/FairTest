# FairTest - Secure Exam Platform

FairTest is a comprehensive secure exam platform that addresses cheating at all stages of the examination process using cryptographic techniques. This platform provides end-to-end security for online exams, from creation to grading.

## Table of Contents

- [Overview](#overview)
- [Security Features](#security-features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
  - [Pre-Exam Security](#pre-exam-security)
  - [During-Exam Security](#during-exam-security)
  - [Post-Exam Security](#post-exam-security)
- [Live Results Feature](#live-results-feature)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Considerations](#security-considerations)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

FairTest addresses the three critical phases of exam security:

1. **Pre-Exam**: Prevents paper leaks before the exam
2. **During-Exam**: Ensures secure access during the exam
3. **Post-Exam**: Verifies the authenticity of results after the exam

The platform uses a combination of symmetric encryption, Shamir's Secret Sharing algorithm, and digital signatures to create a secure and transparent examination system.

## Security Features

### 1. Pre-Exam Security (Paper Leak Prevention)
- AES-256-CBC encryption for exam questions and answers
- Prevents unauthorized access to exam content before the exam starts

### 2. During Exam Security (Access Control)
- Shamir's Secret Sharing algorithm for key distribution
- Requires multiple authorized parties to collaborate to decrypt exam content
- Threshold-based approach ensures no single point of failure

### 3. Post-Exam Security (Result Verification)
- Digital signatures using public key cryptography (TweetNaCl)
- Verifies the authenticity of exam results
- Prevents unauthorized modifications to marks and rankings
- Each submission is cryptographically signed by the student

## Technology Stack

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Cryptographic libraries (crypto, tweetnacl, shamirs-secret-sharing)

### Frontend
- React.js
- React Bootstrap for UI components
- Axios for API requests

## How It Works

### Pre-Exam Security

1. **Encryption Process**:
   ```javascript
   // Example of AES-256-CBC encryption
   function encrypt(text, key, iv) {
       const algorithm = 'aes-256-cbc';
       const cipher = crypto.createCipheriv(algorithm, key, iv);
       let encrypted = cipher.update(text, 'utf8', 'hex');
       encrypted += cipher.final('hex');
       return encrypted;
   }
   ```

2. **Implementation Steps**:
   - Examiner creates an exam with questions and answers
   - System generates a random encryption key and initialization vector (IV)
   - Questions and answers are encrypted using AES-256-CBC
   - Encrypted content is stored in the database
   - The encryption key is split into shares using Shamir's Secret Sharing

### During-Exam Security

1. **Shamir's Secret Sharing**:
   ```javascript
   // Example of Shamir's Secret Sharing
   const secret = Buffer.from('Encryption key');
   // Create shares with a threshold
   const shares = sss.split(secret, { shares: 3, threshold: 2 });
   // Recover the secret with a subset of shares
   const recovered = sss.combine(shares.slice(0, 2));
   ```

2. **Implementation Steps**:
   - The encryption key is split into multiple shares
   - A threshold is set (e.g., 2 out of 3 shares are needed)
   - Shares are distributed to different authorized parties
   - During the exam, authorized parties provide their shares
   - When enough shares are collected, the key is reconstructed
   - The exam content is decrypted and presented to students

### Post-Exam Security

1. **Digital Signatures**:
   ```javascript
   // Example of digital signature creation and verification
   const messageBytes = decodeUTF8(message);
   const signature = nacl.sign.detached(messageBytes, secretKey);
   const isValid = nacl.sign.detached.verify(messageBytes, signature, publicKey);
   ```

2. **Implementation Steps**:
   - Each student receives a key pair (public and private keys)
   - When submitting answers, the student signs the submission with their private key
   - The system stores the signature along with the submission
   - During grading, the signature is verified using the student's public key
   - This ensures that submissions haven't been tampered with

## Live Results Feature

FairTest includes a real-time results dashboard that provides transparency and immediate feedback:

1. **Features**:
   - Real-time statistics (total submissions, graded submissions, average score, highest score)
   - Grading progress visualization
   - Detailed results table with verification status
   - Configurable auto-refresh intervals

2. **Implementation**:
   - Backend endpoint (`/api/results/live/:examId`) provides formatted results data
   - Frontend polls this endpoint at regular intervals
   - React state updates trigger UI refreshes
   - Statistics are calculated on the server for efficiency

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/arjun248c/FairTest.git
cd fairtest
```

2. Install dependencies
```
npm install
cd client
npm install
cd ..
```

3. Create a .env file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fairtest
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Run the application
```
# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

## Usage

### User Roles

1. **Student**
   - Register and login
   - View available exams
   - Take exams during the active period
   - View their results

2. **Examiner**
   - Create and manage exams
   - Encrypt exam content
   - Distribute key shares
   - Grade and verify exam results

3. **Admin**
   - All examiner privileges
   - Verify result signatures
   - Manage users

### Exam Workflow

1. **Exam Creation**
   - Examiner creates an exam with questions and answers
   - Content is encrypted using AES-256-CBC
   - Encryption key is split into shares using Shamir's Secret Sharing
   - Key shares are distributed to authorized parties

2. **Exam Taking**
   - Students access the exam during the active period
   - Key shares are combined to decrypt the exam content
   - Students submit their answers
   - Submissions are digitally signed

3. **Grading and Verification**
   - Examiner grades the submissions
   - Digital signatures verify the authenticity of submissions
   - Results are published to students

## Security Considerations

- Key shares should be distributed securely to different authorized parties
- The threshold for key reconstruction should be set appropriately
- Students should keep their secret keys secure for digital signatures
- All communication is secured using HTTPS

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Exam Endpoints

- `POST /api/exams` - Create a new exam
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `PUT /api/exams/:id/status` - Update exam status
- `POST /api/exams/:id/decrypt` - Decrypt exam with key shares

### Result Endpoints

- `POST /api/results` - Submit exam result
- `POST /api/results/:id/grade` - Grade exam result
- `GET /api/results/exam/:examId` - Get results for an exam
- `GET /api/results/student` - Get student's results
- `POST /api/results/:id/verify` - Verify result signature
- `GET /api/results/live/:examId` - Get live exam results

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shamir's Secret Sharing algorithm
- TweetNaCl.js for digital signatures
- AES encryption for content protection

---

Created by [Arjun](https://github.com/arjun248c)
