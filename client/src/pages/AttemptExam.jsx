import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import examService from '../services/examService';
import submissionService from '../services/submissionService';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Send, AlertTriangle } from 'lucide-react';

const AttemptExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [exam, setExam] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ show: false, type: '', message: '' });

    const submitExam = useCallback(async (type = 'manual') => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.values(answers);
            await submissionService.submitExam({
                examId: id,
                answers: formattedAnswers,
                submissionType: type,
                warningCount: warningCount
            }, user.token);

            if (type === 'integrity') {
                setSubmissionStatus({
                    show: true,
                    type: 'error',
                    message: 'Test ended and submitted automatically due to multiple integrity violations.'
                });
            } else if (type === 'auto') {
                setSubmissionStatus({
                    show: true,
                    type: 'warning',
                    message: 'Time is up! Your test has been submitted automatically.'
                });
            } else {
                setSubmissionStatus({
                    show: true,
                    type: 'success',
                    message: 'Test submitted successfully!'
                });
            }
        } catch (error) {
            console.error('Submission failed:', error);
            setSubmissionStatus({
                show: true,
                type: 'error',
                message: 'Failed to submit exam: ' + (error.response?.data?.error || error.message)
            });
            setIsSubmitting(false);
        }
    }, [id, answers, user.token, isSubmitting, warningCount]);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await examService.getExam(id, user.token);
                setExam(data);
                setTimeLeft(data.duration * 60);
            } catch (error) {
                console.error('Failed to fetch exam');
                navigate('/dashboard');
            }
        };
        fetchExam();
    }, [id, user.token, navigate]);


    useEffect(() => {
        if (!isAcknowledged || !exam) return;

        if (timeLeft <= 0) {
            submitExam('auto');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, exam, isAcknowledged, submitExam]);


    useEffect(() => {
        if (warningCount >= 3 && !isSubmitting && isAcknowledged) {
            submitExam('integrity');
        }
    }, [warningCount, isSubmitting, isAcknowledged, submitExam]);


    useEffect(() => {
        if (!isAcknowledged || isSubmitting) return;

        const handleFocusLoss = () => {

            if (isSubmitting || document.visibilityState !== 'hidden') return;

            setWarningCount(prev => {
                if (prev >= 3) return prev;
                const newCount = prev + 1;
                if (newCount < 3) {
                    setShowWarningModal(true);
                }
                return newCount;
            });
        };

        const handleBeforeUnload = (e) => {
            if (isSubmitting) return;
            e.preventDefault();
            e.returnValue = '';
        };

        document.addEventListener('visibilitychange', handleFocusLoss);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleFocusLoss);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isAcknowledged, isSubmitting]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleAnswerSelect = (questionId, optionText) => {
        setAnswers({
            ...answers,
            [questionId]: { questionId, selectedOption: optionText }
        });
    };

    const handleEndTest = () => {
        setShowEndModal(true);
    };

    if (!exam) return <div className="container">Loading exam content...</div>;

    const currentQuestion = exam.questions[currentQuestionIndex];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--background)',
            zIndex: 2000,
            overflowY: 'auto',
            padding: '2rem 0'
        }}>

            <AnimatePresence>
                {!isAcknowledged && (
                    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 3000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card"
                            style={{ maxWidth: '600px', width: '90%', padding: '2.5rem', textAlign: 'center' }}
                        >
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                                <AlertTriangle size={40} />
                            </div>
                            <h2 style={{ marginBottom: '1rem' }}>Exam Acknowledgement</h2>
                            <div style={{ textAlign: 'left', marginBottom: '2rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '0.75rem' }}>By clicking "Start Test", you agree to the following terms:</p>
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    <li>I will not attempt to switch tabs or minimize the browser window.</li>
                                    <li><strong>Integrity Policy:</strong> Switching tabs or losing window focus will result in a warning.</li>
                                    <li>After <strong>3 warnings</strong>, the test will be <strong>automatically submitted</strong>.</li>
                                    <li>The timer continues to run even if the window is hidden.</li>
                                    <li>Do not refresh or close the browser window.</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => setIsAcknowledged(true)}
                                className="btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            >
                                I Agree & Start Test
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{ background: 'transparent', color: 'var(--text-muted)', marginTop: '1rem', border: 'none', cursor: 'pointer' }}
                            >
                                Go Back
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="container" style={{ paddingBottom: '4rem', filter: !isAcknowledged ? 'blur(5px)' : 'none' }}>

                <AnimatePresence>
                    {showWarningModal && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="glass-card warning-pop"
                            >
                                <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>
                                    <AlertTriangle size={48} style={{ margin: '0 auto' }} />
                                </div>
                                <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Integrity Warning!</h2>
                                <p style={{ margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
                                    You have moved out of the test window. This is a violation of the exam rules.
                                </p>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--error)' }}>
                                        Warning Count: {warningCount} / 3
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Note: On the 3rd attempt, your test will be terminated and submitted.
                                </p>
                                <button
                                    onClick={() => setShowWarningModal(false)}
                                    className="btn-primary"
                                    style={{ marginTop: '2rem', width: '100%' }}
                                >
                                    I Understand
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


                <AnimatePresence>
                    {showEndModal && (
                        <div className="modal-overlay" style={{ zIndex: 4000 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card"
                                style={{ maxWidth: '450px', width: '90%', padding: '2.5rem', textAlign: 'center' }}
                            >
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                                    <Send size={32} />
                                </div>
                                <h2 style={{ marginBottom: '1rem' }}>End Test?</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                    Are you sure you want to end the test? All your current answers will be saved, and you will not be able to return to this exam.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setShowEndModal(false)}
                                        className="btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowEndModal(false);
                                            submitExam();
                                        }}
                                        className="btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        End & Submit
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


                <AnimatePresence>
                    {submissionStatus.show && (
                        <div className="modal-overlay" style={{ zIndex: 5000 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card"
                                style={{
                                    maxWidth: '450px',
                                    width: '90%',
                                    padding: '2.5rem',
                                    textAlign: 'center',
                                    border: `2px solid ${submissionStatus.type === 'success' ? 'var(--success)' : 'var(--error)'}`
                                }}
                            >
                                <div style={{
                                    background: submissionStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    color: submissionStatus.type === 'success' ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {submissionStatus.type === 'success' ? <Send size={40} /> : <AlertTriangle size={40} />}
                                </div>
                                <h2 style={{ marginBottom: '1rem' }}>
                                    {submissionStatus.type === 'success' ? 'Submitted!' : 'Test Ended'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                    {submissionStatus.message}
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        background: submissionStatus.type === 'success' ? 'var(--success)' : 'var(--error)',
                                        borderColor: submissionStatus.type === 'success' ? 'var(--success)' : 'var(--error)'
                                    }}
                                >
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.25rem' }}>{exam.title}</h2>
                        <span style={{ color: 'var(--text-muted)' }}>{exam.subject}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            onClick={handleEndTest}
                            className="btn-secondary"
                            style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                        >
                            <Send size={18} style={{ transform: 'rotate(-45deg)' }} />
                            <span>End Test</span>
                        </button>
                        <div className={`glass-card ${timeLeft < 300 ? 'text-error' : ''}`} style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: timeLeft < 300 ? 'var(--error)' : 'var(--border)' }}>
                            <Clock size={20} color={timeLeft < 300 ? 'var(--error)' : 'var(--primary)'} />
                            <span style={{ fontWeight: '700', fontSize: '1.25rem', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2.5rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div style={{ marginBottom: '2rem' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
                                    <h3 style={{ fontSize: '1.5rem' }}>{currentQuestion?.text || 'No question text provided'}</h3>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {currentQuestion?.options?.map((option, idx) => (
                                        <label
                                            key={idx}
                                            className={`option-card ${answers[currentQuestion._id]?.selectedOption === option.text ? 'active' : ''}`}
                                            onClick={() => handleAnswerSelect(currentQuestion._id, option.text)}
                                        >
                                            <div className="radio-circle"></div>
                                            <span>{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                className="btn-secondary"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                <ChevronLeft size={20} />
                                <span>Previous Question</span>
                            </button>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {currentQuestionIndex === exam.questions.length - 1 ? (
                                    <button
                                        className="btn-primary"
                                        onClick={() => submitExam()}
                                        disabled={isSubmitting}
                                        style={{ background: 'var(--success)', color: 'white' }}
                                    >
                                        <Send size={20} />
                                        <span>{isSubmitting ? 'Submitting...' : 'Complete Exam'}</span>
                                    </button>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    >
                                        <span>Next Question</span>
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Question Palette</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                            {exam.questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        padding: '0',
                                        borderRadius: '8px',
                                        background: currentQuestionIndex === idx ? 'var(--primary)' : answers[exam.questions[idx]._id] ? 'var(--success)' : 'var(--surface)',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                <span>Current</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '3px' }}></div>
                                <span>Answered</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--surface)', borderRadius: '3px' }}></div>
                                <span>Not Visited</span>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                .warning-pop {
                    max-width: 400px;
                    width: 90%;
                    padding: 2.5rem;
                    text-align: center;
                    border: 2px solid var(--error);
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
                }
                .option-card {
                    padding: 1.25rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.2s;
                }
                .option-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--primary);
                }
                .option-card.active {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: var(--primary);
                }
                .radio-circle {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border);
                    border-radius: 50%;
                    position: relative;
                }
                .option-card.active .radio-circle {
                    border-color: var(--primary);
                }
                .option-card.active .radio-circle::after {
                    content: '';
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: var(--primary);
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .text-error {
                    color: var(--error);
                    animation: pulse 1s infinite alternate;
                }
                @keyframes pulse {
                    from { opacity: 1; }
                    to { opacity: 0.7; }
                }
            `}</style>
            </div>
        </div>
    );
};

export default AttemptExam;

