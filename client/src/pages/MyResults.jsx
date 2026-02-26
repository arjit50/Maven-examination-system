import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import submissionService from '../services/submissionService';
import examService from '../services/examService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Calendar,
    BookOpen,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    FileText,
    HelpCircle
} from 'lucide-react';
import ActionModal from '../components/common/ActionModal';

const MyResults = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [fullExamData, setFullExamData] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await submissionService.getMySubmissions(user.token);
                setResults(data);
            } catch (error) {
                console.error('Failed to fetch results');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [user.token]);

    const viewDetails = async (submission) => {
        setSelectedSubmission(submission);
        setIsDetailsLoading(true);
        try {
            
            const examData = await examService.getExam(submission.exam._id, user.token);
            setFullExamData(examData);
        } catch (error) {
            console.error('Failed to fetch exam details');
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Loading Failed',
                message: 'Could not load detailed questions for this attempt.'
            });
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedSubmission(null);
        setFullExamData(null);
    };

    if (isLoading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading your performance report...</div>;

    if (selectedSubmission) {
        return (
            <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                <button
                    onClick={closeDetails}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        marginBottom: '1.5rem',
                        padding: 0,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} />
                    <span>Back to All Results</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card"
                            style={{ padding: '2rem', marginBottom: '2rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h1 style={{ marginBottom: '0.5rem' }}>{selectedSubmission.exam.title}</h1>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                        {selectedSubmission.exam.subject} • Completed on {new Date(selectedSubmission.submittedAt || selectedSubmission.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '12px',
                                    background: selectedSubmission.score >= (selectedSubmission.exam.passingMarks || 0) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: selectedSubmission.score >= (selectedSubmission.exam.passingMarks || 0) ? 'var(--success)' : 'var(--error)',
                                    fontWeight: '700',
                                    textAlign: 'center'
                                }}>
                                    <h2 style={{ margin: 0 }}>{selectedSubmission.score} / {selectedSubmission.exam.totalMarks}</h2>
                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        {selectedSubmission.score >= (selectedSubmission.exam.passingMarks || 0) ? 'Result: PASSED' : 'Result: FAILED'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <h3 style={{ marginBottom: '1.5rem' }}>Question Breakdown</h3>
                        {isDetailsLoading ? (
                            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>Loading question details...</div>
                        ) : fullExamData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {fullExamData.questions.map((q, idx) => {
                                    const studentAnswer = selectedSubmission.answers.find(ans => String(ans.question) === String(q._id));
                                    const correctOption = q.options.find(opt => opt.isCorrect);
                                    const isCorrect = studentAnswer && studentAnswer.selectedOption === correctOption?.text;

                                    return (
                                        <motion.div
                                            key={q._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="glass-card"
                                            style={{
                                                padding: '1.5rem',
                                                border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                                background: isCorrect ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Question {idx + 1}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {isCorrect ? (
                                                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <CheckCircle2 size={16} /> Correct (+{q.marks})
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--error)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <XCircle size={16} /> Incorrect (0/{q.marks})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '500' }}>{q.text}</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`
                                                }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Your Answer:</span>
                                                    <span style={{ fontWeight: '600' }}>{studentAnswer?.selectedOption || 'Not attempted'}</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div style={{
                                                        padding: '1rem',
                                                        borderRadius: '10px',
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid var(--success)'
                                                    }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Correct Answer:</span>
                                                        <span style={{ fontWeight: '600' }}>{correctOption?.text}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    {}
                    <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} color="var(--primary)" />
                                Performance Stats
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Questions</span>
                                    <span style={{ fontWeight: '600' }}>{fullExamData?.questions.length || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Correct Answers</span>
                                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                                        {selectedSubmission.answers.filter((ans, idx) => {
                                            const q = fullExamData?.questions[idx];
                                            const correct = q?.options.find(opt => opt.isCorrect);
                                            return ans.selectedOption === correct?.text;
                                        }).length || 0}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Passing Mark</span>
                                    <span style={{ fontWeight: '600' }}>{selectedSubmission.exam.passingMarks}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <HelpCircle size={20} />
                                <h4 style={{ margin: 0 }}>Review Tip</h4>
                            </div>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0, opacity: 0.9 }}>
                                Focus on the red questions. Review the correct answers to understand where you can improve for your next attempt!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                    <Trophy size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0 }}>My Exam Results</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track your performance and progress</p>
                </div>
            </div>

            {results.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                        <BookOpen size={30} />
                    </div>
                    <h3>No attempts yet</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>You haven't attempted any exams. Head over to the dashboard to start your first test!</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">View Available Exams</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {results.map((result, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={result._id}
                            className="glass-card result-card"
                            onClick={() => viewDetails(result)}
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: result.score >= (result.exam?.passingMarks || 0) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: result.score >= (result.exam?.passingMarks || 0) ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {result.score >= (result.exam?.passingMarks || 0) ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{result.exam?.title || 'Unknown Exam'}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <BookOpen size={14} /> {result.exam?.subject}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Calendar size={14} /> {new Date(result.submittedAt || result.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score Obtained</p>
                                    <h2 style={{
                                        margin: 0,
                                        color: result.score >= (result.exam?.passingMarks || 0) ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {result.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {result.exam?.totalMarks || 0}</span>
                                    </h2>
                                </div>
                                <ChevronRight size={24} color="var(--text-muted)" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
                .result-card:hover {
                    transform: translateY(-3px);
                    border-color: var(--primary);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>

            <ActionModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
            />
        </div>
    );
};

export default MyResults;

