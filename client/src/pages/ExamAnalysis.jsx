import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import examService from '../services/examService';
import submissionService from '../services/submissionService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    BookOpen,
    CheckCircle,
    XCircle,
    Award,
    ChevronRight,
    ArrowLeft,
    Clock,
    FileText,
    HelpCircle,
    Edit
} from 'lucide-react';

const ExamAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [exam, setExam] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examData, subsData] = await Promise.all([
                    examService.getExam(id, user.token),
                    submissionService.getExamSubmissions(id, user.token)
                ]);
                setExam(examData);
                setSubmissions(subsData);
            } catch (error) {
                console.error('Failed to fetch analysis data');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, user.token, navigate]);

    if (isLoading) return <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>Loading analysis...</div>;
    if (!exam) return <div className="container">Exam not found.</div>;

    const studentAverage = submissions.length > 0
        ? (submissions.reduce((acc, curr) => acc + curr.score, 0) / submissions.length).toFixed(1)
        : 0;

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-muted)', padding: 0 }}
                >
                    <ArrowLeft size={18} />
                    <span>Back to Dashboard</span>
                </button>
                {user.user.role === 'teacher' && (
                    <button
                        onClick={() => navigate(`/edit-exam/${id}`)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                    >
                        <Edit size={16} />
                        <span>Edit Exam & Questions</span>
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h1 style={{ marginBottom: '0.5rem' }}>{exam.title}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>{exam.subject} • {exam.duration} Minutes</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', background: 'var(--surface)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>{submissions.length}</h4>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Attempts</p>
                                </div>
                                <div style={{ textAlign: 'center', background: 'var(--surface)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ margin: 0, color: 'var(--success)' }}>{studentAverage}</h4>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg. Score</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <BookOpen size={16} />
                                    <span>Description</span>
                                </div>
                                <p style={{ fontSize: '0.95rem' }}>{exam.description || 'No description provided.'}</p>
                            </div>
                            <div style={{ width: '150px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <Award size={16} />
                                    <span>Max Marks</span>
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>{exam.totalMarks}</p>
                            </div>
                        </div>
                    </motion.div>

                    <h3 style={{ marginBottom: '1.5rem' }}>Student Submissions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {submissions.length === 0 ? (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No students have attempted this exam yet.
                            </div>
                        ) : (
                            submissions.map((sub, idx) => (
                                <motion.div
                                    key={sub._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass-card student-row ${selectedStudent?._id === sub._id ? 'active' : ''}`}
                                    onClick={() => setSelectedStudent(sub)}
                                    style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        border: selectedStudent?._id === sub._id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: selectedStudent?._id === sub._id ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>
                                            {sub.student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{sub.student.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.student.email}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '800',
                                                    letterSpacing: '0.5px',
                                                    background: sub.submissionType === 'manual' ? 'rgba(16, 185, 129, 0.1)' : sub.submissionType === 'auto' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: sub.submissionType === 'manual' ? 'var(--success)' : sub.submissionType === 'auto' ? 'var(--primary)' : 'var(--error)',
                                                    border: `1px solid ${sub.submissionType === 'manual' ? 'var(--success)' : sub.submissionType === 'auto' ? 'var(--primary)' : 'var(--error)'}`
                                                }}>
                                                    {sub.submissionType === 'manual' ? 'MANUAL SUBMIT' : sub.submissionType === 'auto' ? 'TIME UP' : 'AUTO-TERMINATED'}
                                                </span>
                                                {sub.warningCount > 0 && (
                                                    <span style={{
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: 'var(--warning)',
                                                        border: '1px solid var(--warning)'
                                                    }}>
                                                        {sub.warningCount} FOCUS WARNINGS
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</p>
                                            <h4 style={{ margin: 0, color: sub.score >= exam.passingMarks ? 'var(--success)' : 'var(--error)' }}>
                                                {sub.score} / {exam.totalMarks}
                                            </h4>
                                        </div>
                                        <ChevronRight size={20} color="var(--text-muted)" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {}
                <div>
                    {!selectedStudent ? (
                        <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HelpCircle size={20} color="var(--primary)" />
                                Exam Questions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {exam.questions.map((q, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Q{idx + 1}. {q.text}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Points: {q.marks}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedStudent._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card"
                                style={{ padding: '2rem', position: 'sticky', top: '100px', border: '1px solid var(--primary)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>Attempt Details</h3>
                                    <button onClick={() => setSelectedStudent(null)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.25rem' }}>
                                        <ArrowLeft size={18} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Score for {selectedStudent.student.name}</p>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: selectedStudent.score >= exam.passingMarks ? 'var(--success)' : 'var(--error)' }}>
                                        {selectedStudent.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ {exam.totalMarks}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {exam.questions.map((q, idx) => {
                                        const answer = selectedStudent.answers.find(a => String(a.question) === String(q._id));
                                        const correctOption = q.options.find(opt => opt.isCorrect);
                                        const isCorrect = answer && answer.selectedOption === correctOption?.text;

                                        return (
                                            <div key={idx} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Question {idx + 1}</span>
                                                    {isCorrect ? (
                                                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                            <CheckCircle size={14} /> Correct
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                            <XCircle size={14} /> Wrong
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{q.text}</p>
                                                <div style={{ padding: '0.75rem', borderRadius: '8px', background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', fontSize: '0.85rem' }}>
                                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Selected Answer:</div>
                                                    <div style={{ fontWeight: '600', color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                                                        {answer?.selectedOption || 'Not Attempted'}
                                                    </div>
                                                    {!isCorrect && (
                                                        <>
                                                            <div style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem' }}>Correct Answer:</div>
                                                            <div style={{ fontWeight: '600', color: 'var(--success)' }}>
                                                                {correctOption?.text}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            <style>{`
                .student-row {
                    transition: transform 0.2s, background 0.2s;
                }
                .student-row:hover {
                    transform: translateX(5px);
                    background: var(--surface-hover);
                }
                .student-row.active {
                    transform: translateX(8px);
                }
            `}</style>
        </div>
    );
};

export default ExamAnalysis;

