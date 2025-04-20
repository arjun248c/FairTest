import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExamCreatePage from './pages/ExamCreatePage';
import ExamDetailPage from './pages/ExamDetailPage';
import ExamTakePage from './pages/ExamTakePage';
import ResultsPage from './pages/ResultsPage';
import LiveResultsPage from './pages/LiveResultsPage';

// Context
import { AuthProvider } from './context/AuthContext';

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

export default App;
