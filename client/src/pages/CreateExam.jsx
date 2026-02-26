import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import examService from '../services/examService';
import questionService from '../services/questionService';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, List, Clock, Book, HelpCircle, CheckCircle2, AlertCircle, Edit, ArrowLeft } from 'lucide-react';
import ActionModal from '../components/common/ActionModal';

const CreateExam = () => {
    const { id } = useParams(); 
    const isEditMode = Boolean(id);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        duration: 30,
        passingMarks: 0,
        isPublished: true
    });

    const [questions, setQuestions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]); 
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

    const [currentQuestion, setCurrentQuestion] = useState({
        text: '',
        type: 'mcq',
        marks: 1,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchExamData = async () => {
                try {
                    const data = await examService.getExam(id, user.token);
                    setFormData({
                        title: data.title,
                        description: data.description || '',
                        subject: data.subject,
                        duration: data.duration,
                        passingMarks: data.passingMarks || 0,
                        isPublished: data.isPublished
                    });
                    
                    const mappedQuestions = data.questions.map(q => ({
                        ...q,
                        id: q._id 
                    }));
                    setQuestions(mappedQuestions);
                } catch (error) {
                    console.error('Failed to fetch exam for editing');
                    setModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Load Error',
                        message: 'Failed to load exam data. Please try again.',
                        onConfirm: () => navigate('/dashboard')
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchExamData();
        }
    }, [id, isEditMode, user.token, navigate]);

    const onInputChange = (e) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const onQuestionChange = (e) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setCurrentQuestion({ ...currentQuestion, [e.target.name]: value });
    };

    const onOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index].text = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const setCorrectOption = (index) => {
        const newOptions = currentQuestion.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addQuestionToList = () => {
        if (!currentQuestion.text.trim()) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Missing Info',
                message: 'Please enter question text before adding.'
            });
            return;
        }
        if (currentQuestion.options.some(opt => !opt.text.trim())) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Incomplete Options',
                message: 'All options must have text before adding to the exam.'
            });
            return;
        }

        const questionToSave = {
            ...currentQuestion,
            marks: Number(currentQuestion.marks)
        };

        if (editingId) {
            
            setQuestions(questions.map(q => q.id === editingId ? { ...questionToSave, id: editingId } : q));
            setEditingId(null);
        } else {
            
            setQuestions([...questions, { ...questionToSave, id: 'temp-' + Date.now() }]);
        }

        setCurrentQuestion({
            text: '',
            type: 'mcq',
            marks: 1,
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
    };

    const editQuestion = (question) => {
        setEditingId(question.id);
        setCurrentQuestion({
            ...question,
            options: JSON.parse(JSON.stringify(question.options)) 
        });
        
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCurrentQuestion({
            text: '',
            type: 'mcq',
            marks: 1,
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
    };

    const removeQuestion = (qId) => {
        setQuestions(questions.filter(q => q.id !== qId));
        
        if (typeof qId === 'string' && !qId.startsWith('temp-')) {
            setDeletedQuestionIds([...deletedQuestionIds, qId]);
        }
        if (editingId === qId) cancelEdit();
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (questions.length === 0) {
            setModal({
                isOpen: true,
                type: 'warning',
                title: 'Empty Exam',
                message: 'Please add at least one question before publishing.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let exam;
            if (isEditMode) {
                exam = await examService.updateExam(id, formData, user.token);
            } else {
                exam = await examService.createExam(formData, user.token);
            }

            const examId = isEditMode ? id : exam._id;

            
            if (isEditMode && deletedQuestionIds.length > 0) {
                await Promise.all(deletedQuestionIds.map(qId => questionService.deleteQuestion(qId, user.token)));
            }

            
            const questionPromises = questions.map(q => {
                const qData = {
                    text: q.text,
                    options: q.options,
                    marks: q.marks,
                    type: q.type,
                    examId: examId
                };

                if (typeof q.id === 'string' && q.id.startsWith('temp-')) {
                    
                    return questionService.addQuestion(qData, user.token);
                } else if (isEditMode) {
                    
                    return questionService.updateQuestion(q.id, qData, user.token);
                } else {
                    
                    return questionService.addQuestion(qData, user.token);
                }
            });

            await Promise.all(questionPromises);

            setModal({
                isOpen: true,
                type: 'success',
                title: isEditMode ? 'Exam Updated' : 'Exam Created',
                message: isEditMode ? 'Exam updated successfully!' : 'Exam created successfully!',
                onConfirm: () => navigate(isEditMode ? `/exam-analysis/${id}` : '/dashboard')
            });
        } catch (error) {
            console.error('Operation failed:', error);
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Operation Failed',
                message: 'Failed to save exam. ' + (error.response?.data?.error || error.message)
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading exam details...</div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                            {isEditMode ? <Edit size={24} /> : <Plus size={24} />}
                        </div>
                        <h1 style={{ margin: 0 }}>{isEditMode ? 'Edit Examination' : 'Create New Examination'}</h1>
                    </div>
                    {isEditMode && (
                        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}>
                            <ArrowLeft size={18} />
                            <span>Go Back</span>
                        </button>
                    )}
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Exam Title</label>
                            <input name="title" value={formData.title} onChange={onInputChange} placeholder="e.g. Advanced Physics Mid-term" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subject</label>
                            <input name="subject" value={formData.subject} onChange={onInputChange} placeholder="e.g. Physics" required />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
                        <textarea name="description" value={formData.description} onChange={onInputChange} placeholder="Provide overview, rules, or instructions for the students..." style={{ minHeight: '80px', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Duration (Minutes)</label>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <Clock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="number" name="duration" value={formData.duration} onChange={onInputChange} style={{ paddingLeft: '3rem' }} required min="1" />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Minimum Passing Marks</label>
                            <div style={{ position: 'relative' }}>
                                <AlertCircle size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="number" name="passingMarks" value={formData.passingMarks} onChange={onInputChange} style={{ paddingLeft: '3rem' }} required min="0" />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HelpCircle size={20} color="var(--primary)" />
                                {editingId ? 'Edit Question' : 'Add MCQ Questions'}
                            </div>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    style={{ background: 'transparent', color: 'var(--error)', fontSize: '0.85rem', fontWeight: '600' }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </h3>

                        <div className="glass-card" style={{
                            padding: '2rem',
                            background: editingId ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.03)',
                            border: `1px ${editingId ? 'solid' : 'dashed'} var(--primary)`,
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Question Text</label>
                                <textarea
                                    name="text"
                                    value={currentQuestion.text}
                                    onChange={onQuestionChange}
                                    placeholder="Enter your question here..."
                                    style={{ minHeight: '60px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Option {index + 1}</label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    checked={option.isCorrect}
                                                    onChange={() => setCorrectOption(index)}
                                                    style={{ width: 'auto' }}
                                                />
                                                <span style={{ color: option.isCorrect ? 'var(--success)' : 'var(--text-muted)' }}>Correct</span>
                                            </label>
                                        </div>
                                        <input
                                            value={option.text}
                                            onChange={(e) => onOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1} text`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <label style={{ marginRight: '1rem', fontWeight: '600', fontSize: '0.85rem' }}>Marks:</label>
                                    <input
                                        type="number"
                                        name="marks"
                                        value={currentQuestion.marks}
                                        onChange={onQuestionChange}
                                        style={{ width: '80px', display: 'inline-block' }}
                                        min="1"
                                    />
                                </div>
                                <button type="button" onClick={addQuestionToList} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                                    {editingId ? 'Update Question' : 'Add to Exam'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {questions.length > 0 && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Questions in Exam ({questions.length}) - <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>Click to edit or drag (simulated)</span></h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <AnimatePresence>
                                    {questions.map((q, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            key={q.id}
                                            className={`glass-card ${editingId === q.id ? 'editing' : ''}`}
                                            onClick={() => editQuestion(q)}
                                            style={{
                                                padding: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: editingId === q.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                                                cursor: 'pointer',
                                                border: editingId === q.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                transition: 'var(--transition)'
                                            }}
                                            whileHover={{ scale: 1.01, background: 'rgba(99, 102, 241, 0.05)' }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {idx + 1}. {q.text}
                                                    {editingId === q.id && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>EDITING</span>}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {q.options.length} Options • {q.marks} Marks
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeQuestion(q.id);
                                                }}
                                                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', zIndex: 10 }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ padding: '1rem 2rem', background: 'transparent', color: 'var(--text-muted)', fontWeight: '600' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting || questions.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', minWidth: '200px', justifyContent: 'center' }}>
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>{isEditMode ? 'Save Changes' : 'Create & Publish Exam'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <ActionModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
};

export default CreateExam;

