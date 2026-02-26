import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Header from './components/layout/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateExam from './pages/CreateExam';
import AttemptExam from './pages/AttemptExam';
import ExamAnalysis from './pages/ExamAnalysis';
import MyResults from './pages/MyResults';
import StudyMaterials from './pages/StudyMaterials';
import Profile from './pages/Profile';
import Chatbot from './components/common/Chatbot';
import CursorFollower from './components/common/CursorFollower';
import BackgroundShapes from './components/common/BackgroundShapes';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Home = () => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();


    tl.from(".hero-title", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    })
      .from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.5")
      .from(".hero-cta", {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.3");
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
        Master Your Exams with <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Maven</span>
      </h1>
      <p className="hero-text" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        The most advanced platform for creating, managing, and attempting online examinations. Secure, real-time, and insightful.
      </p>
      <div className="hero-cta" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
        <Link to="/register" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Get Started Free</Link>
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/edit-exam/:id" element={<CreateExam />} />
        <Route path="/exam/:id" element={<AttemptExam />} />
        <Route path="/my-results" element={<MyResults />} />
        <Route path="/materials" element={<StudyMaterials />} />
        <Route path="/exam-analysis/:id" element={<ExamAnalysis />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Chatbot />
      <CursorFollower />
      <BackgroundShapes />
    </Router>
  )
}

export default App

