import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword, logout, reset } from '../features/auth/authSlice';
import submissionService from '../services/submissionService';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Save, TrendingUp, Award, Calendar, Settings, Lock, X, AlertCircle, LogOut } from 'lucide-react';
import ActionModal from '../components/common/ActionModal';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        name: user?.user?.name || '',
        email: user?.user?.email || '',
    });

    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [stats, setStats] = useState({
        totalExams: 0,
        avgScore: 0,
        highestScore: 0,
        recentActivity: []
    });

    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    if (!user) return null;

    useEffect(() => {
        if (user?.user?.role === 'student') {
            const fetchPerformance = async () => {
                try {
                    const submissions = await submissionService.getMySubmissions(user.token);
                    if (submissions && submissions.length > 0) {
                        const total = submissions.length;
                        const percentages = submissions.map(s => {
                            const totalMarks = s.exam?.totalMarks || 100;
                            return (s.score / totalMarks) * 100;
                        });

                        const avg = percentages.reduce((a, b) => a + b, 0) / total;
                        const highest = Math.max(...percentages);

                        setStats({
                            totalExams: total,
                            avgScore: Math.round(avg),
                            highestScore: Math.round(highest),
                            recentActivity: submissions.map((s, idx) => ({
                                ...s,
                                scorePercent: Math.round((s.score / (s.exam?.totalMarks || 100)) * 100)
                            })).slice(0, 5)
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch stats:', error);
                }
            };
            fetchPerformance();
        }
    }, [user]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(updateProfile(formData));
    };

    const onPasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Mismatch',
                message: 'New passwords do not match. Please try again.'
            });
            return;
        }
        dispatch(updatePassword({
            currentPassword: passwordFormData.currentPassword,
            newPassword: passwordFormData.newPassword
        })).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                setShowPasswordModal(false);
                setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Updated!',
                    message: 'Password changed successfully!'
                });
            }
        });
    };

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    useEffect(() => {
        if (isSuccess && message === 'Profile Updated') {

        }
    }, [isSuccess, message]);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}
            >
                { }
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: 'white',
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                        }}>
                            {user?.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ marginBottom: '0.25rem' }}>{user?.user?.name}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user?.user?.email}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={14} />
                                {user?.user?.role.toUpperCase()}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>

                        <button
                            onClick={onLogout}
                            className="btn-secondary"
                            style={{
                                width: '100%',
                                gap: '0.75rem',
                                color: 'var(--error)',
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                background: 'rgba(239, 68, 68, 0.05)'
                            }}
                        >
                            <LogOut size={20} />
                            Log Out Session
                        </button>
                    </div>

                    {user?.user?.role === 'student' && (
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <TrendingUp size={24} color="var(--primary)" />
                                Performance
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.totalExams}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exams Taken</span>
                                </div>
                                <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{stats.avgScore}%</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg. Score</span>
                                </div>
                                <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Award size={20} color="var(--warning)" />
                                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{stats.highestScore}%</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest Achievement</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                { }
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Settings size={24} color="var(--primary)" />
                        Profile Settings
                    </h3>

                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    style={{ paddingLeft: '3rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={onChange}
                                    style={{ paddingLeft: '3rem' }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                            <div style={{ position: 'relative', opacity: 0.6 }}>
                                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value="••••••••••••"
                                    disabled
                                    style={{ paddingLeft: '3rem', cursor: 'not-allowed' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        color: 'var(--primary)',
                                        fontSize: '0.8rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Change
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Security settings can be managed by contacting administration.</p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', gap: '0.75rem' }}
                            disabled={isLoading}
                        >
                            <Save size={20} />
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>

                    {isSuccess && (
                        <p style={{ color: 'var(--success)', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            Profile updated successfully!
                        </p>
                    )}
                    {isError && (
                        <p style={{ color: 'var(--error)', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            {message}
                        </p>
                    )}
                </div>
            </motion.div>

            { }
            {user?.user?.role === 'student' && stats.recentActivity.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                    style={{ marginTop: '2rem', padding: '2rem' }}
                >
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Performance History</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem' }}>Exam Title</th>
                                    <th style={{ padding: '1rem' }}>Date Attempted</th>
                                    <th style={{ padding: '1rem' }}>Score</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentActivity.map((sub, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{sub.exam?.title || 'Exam'}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontWeight: '700', color: sub.scorePercent >= 50 ? 'var(--success)' : 'var(--error)' }}>
                                                {sub.scorePercent}%
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                                ({sub.score}/{sub.exam?.totalMarks})
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.75rem',
                                                background: sub.scorePercent >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: sub.scorePercent >= 50 ? 'var(--success)' : 'var(--error)',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {sub.scorePercent >= 50 ? 'Passed' : 'Failed'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
            { }
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="modal-overlay" style={{ zIndex: 1000 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ maxWidth: '450px', width: '90%', padding: '2.5rem', position: 'relative' }}
                        >
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>

                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Lock size={24} color="var(--primary)" />
                                Change Password
                            </h3>

                            <form onSubmit={onPasswordSubmit}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordFormData.currentPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength="6"
                                        value={passwordFormData.newPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordFormData.confirmPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                                        placeholder="Repeat new password"
                                    />
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                    {isLoading ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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

export default Profile;

