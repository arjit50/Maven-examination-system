import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import { BookOpen, Clock, Award, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ActionModal from '../components/common/ActionModal';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
    const navigate = useNavigate();

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const data = await examService.getExams(user.token);
            setExams(data);
        } catch (error) {
            console.error('Failed to fetch exams');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchExams();
    }, [user, navigate]);

    const handleDelete = async (id, title) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Exam?',
            message: `Are you sure you want to delete "${title}"? This will permanently remove the exam and all its associated questions.`,
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await examService.deleteExam(id, user.token);
                    fetchExams();
                } catch (error) {
                    setModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Delete Failed',
                        message: 'Failed to delete exam: ' + (error.response?.data?.error || error.message)
                    });
                }
            }
        });
    };

    if (!user) return null;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.user.name}</span></p>
                </div>
                {user.user.role === 'teacher' && (
                    <button className="btn-primary" onClick={() => navigate('/create-exam')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} />
                        <span>Create Exam</span>
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {isLoading ? (
                    <p>Loading exams...</p>
                ) : exams.length > 0 ? (
                    exams.map((exam, index) => (
                        <motion.div
                            key={exam._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card"
                            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <BookOpen size={24} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', background: 'var(--surface)', padding: '0.25rem 0.75rem', borderRadius: '50px', color: 'var(--text-muted)' }}>
                                        {exam.subject}
                                    </span>
                                    {user.user.role === 'teacher' && (
                                        <span style={{
                                            fontSize: '0.8rem',
                                            background: exam.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '50px',
                                            color: exam.isPublished ? 'var(--success)' : 'var(--warning)',
                                            border: `1px solid ${exam.isPublished ? 'var(--success)' : 'var(--warning)'}`
                                        }}>
                                            {exam.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 style={{ marginBottom: '0.25rem' }}>{exam.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>By: {exam.teacher?.name || 'Unknown Teacher'}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{exam.description || 'No description provided.'}</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <Clock size={16} />
                                    <span>{exam.duration} mins</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <Award size={16} />
                                    <span>{exam.totalMarks} Marks</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate(user.user.role === 'student' ? `/exam/${exam._id}` : `/exam-analysis/${exam._id}`)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <span>{user.user.role === 'student' ? 'Start Exam' : 'View Details'}</span>
                                    <ArrowRight size={18} />
                                </button>
                                {user.user.role === 'teacher' && (
                                    <button
                                        onClick={() => handleDelete(exam._id, exam.title)}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: 'var(--error)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: 'var(--radius)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'var(--error)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                            e.currentTarget.style.color = 'var(--error)';
                                        }}
                                        title="Delete Exam"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No exams available at the moment.</p>
                        {user.user.role === 'teacher' && <button onClick={() => navigate('/create-exam')} className="btn-primary">Create Your First Exam</button>}
                    </div>
                )}
            </div>

            <ActionModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                confirmText={modal.confirmText}
            />
        </div>
    );
};

export default Dashboard;

