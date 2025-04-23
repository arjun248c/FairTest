# FairTest - Secure Exam Platform

FairTest is a cryptographically secure examination platform designed to prevent cheating at all stages of the exam process. It uses advanced cryptographic techniques to ensure exam integrity before, during, and after the examination.

![FairTest Platform](https://via.placeholder.com/800x400?text=FairTest+Platform)

## Features

### Security at Every Stage

- **Pre-Exam Security**: AES-256-CBC encryption prevents paper leaks before the exam
- **During-Exam Security**: Shamir's Secret Sharing algorithm ensures secure access during the exam
- **Post-Exam Security**: Digital signatures verify the authenticity of results after the exam

### Key Features

- **Secure Exam Creation**: Create exams with encrypted questions and answers
- **Distributed Key Management**: Split encryption keys using Shamir's Secret Sharing
- **Role-Based Access**: Different permissions for students, examiners, and administrators
- **Digital Signatures**: Cryptographically verify the authenticity of submissions
- **Live Results**: Real-time display of exam results
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React, React Router, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Cryptography**: AES-256-CBC, Shamir's Secret Sharing, Digital Signatures

## Security Architecture

FairTest implements a three-layer security architecture:

1. **Pre-Exam Security**
   - Questions and answers are encrypted using AES-256-CBC
   - Encryption keys are never stored directly in the database
   - Only encrypted content is stored in the database

2. **During-Exam Security**
   - Encryption keys are split into multiple shares using Shamir's Secret Sharing
   - A threshold of shares (default: 2) is required to reconstruct the key
   - Shares are distributed among trusted authorities
   - No single entity can decrypt the exam without collaboration

3. **Post-Exam Security**
   - Student submissions are digitally signed
   - Signatures are verified to prevent tampering with results
   - Comprehensive audit logging of all security-critical operations

## Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/400x200?text=Dashboard)

### Exam Creation
![Exam Creation](https://via.placeholder.com/400x200?text=Exam+Creation)

### Taking an Exam
![Taking an Exam](https://via.placeholder.com/400x200?text=Taking+an+Exam)

### Live Results
![Live Results](https://via.placeholder.com/400x200?text=Live+Results)

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fairtest.git
   cd fairtest
   ```

2. Install dependencies
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/fairtest
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Run the development server
   ```
   npm run dev
   ```

## Usage

### Creating an Exam

1. Register as an examiner
2. Create a new exam with questions and answers
3. Set the exam start and end times
4. Distribute key shares to trusted authorities
5. Publish the exam when ready

### Taking an Exam

1. Register as a student
2. Log in during the exam period
3. Select the active exam
4. Answer the questions
5. Submit your answers with a digital signature

### Viewing Results

1. Examiners combine key shares to decrypt and grade submissions
2. Students can view their results once grading is complete
3. Live results show anonymized performance statistics

## Security Best Practices

For maximum security, follow these guidelines:

1. **Distribute key shares to different trusted authorities**
2. **Never store all key shares in one place**
3. **Ensure each authority understands the importance of securing their share**
4. **Establish a secure protocol for bringing shares together during exam time**

## Documentation

For more detailed documentation, see:

- [Build Documentation](BUILD.md) - Detailed explanation of the codebase
- [Security Model](https://github.com/yourusername/fairtest/wiki/Security-Model) - In-depth explanation of the security features
- [API Documentation](https://github.com/yourusername/fairtest/wiki/API-Documentation) - API endpoints and usage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing) - The cryptographic algorithm used for key distribution
- [AES Encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) - The encryption standard used to secure exam content
- [Digital Signatures](https://en.wikipedia.org/wiki/Digital_signature) - The technology used to verify submission authenticity
