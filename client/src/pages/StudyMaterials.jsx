import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import materialService from '../services/materialService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book,
    Link as LinkIcon,
    FileText,
    Video,
    Plus,
    Trash2,
    Download,
    Search,
    Filter,
    ArrowRight,
    Upload
} from 'lucide-react';
import ActionModal from '../components/common/ActionModal';

const StudyMaterials = () => {
    const { user } = useSelector((state) => state.auth);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

    
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        description: '',
        subject: '',
        contentUrl: '',
        type: 'link'
    });

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const data = await materialService.getMaterials(user.token);
                setMaterials(data);
            } catch (error) {
                console.error('Failed to fetch materials');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, [user.token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let contentUrl = newMaterial.contentUrl;

            
            if (selectedFile && (newMaterial.type === 'pdf' || newMaterial.type === 'doc')) {
                contentUrl = await materialService.uploadFile(selectedFile, user.token);
            }

            const materialData = { ...newMaterial, contentUrl };
            const created = await materialService.createMaterial(materialData, user.token);

            setMaterials([created, ...materials]);
            setShowAddForm(false);
            setNewMaterial({ title: '', description: '', subject: '', contentUrl: '', type: 'link' });
            setSelectedFile(null);
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Upload Error',
                message: error.response?.data?.error || 'Failed to add material'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Resource?',
            message: 'Are you sure you want to permanently remove this study material?',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await materialService.deleteMaterial(id, user.token);
                    setMaterials(materials.filter(m => m._id !== id));
                } catch (error) {
                    setModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Delete Failed',
                        message: 'Failed to delete the resource. Please try again.'
                    });
                }
            }
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText size={20} />;
            case 'video': return <Video size={20} />;
            case 'doc': return <Book size={20} />;
            default: return <LinkIcon size={20} />;
        }
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || m.type === filterType;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading resources...</div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                        <Book size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>Study Materials</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hand-picked resources to help you excel</p>
                    </div>
                </div>
                {user.user.role === 'teacher' && (
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {showAddForm ? 'Close Form' : <><Plus size={20} /> Add Resource</>}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '2.5rem', overflow: 'hidden' }}
                    >
                        <h3 style={{ marginBottom: '1.5rem' }}>Upload New Resource</h3>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Resource Title</label>
                                <input
                                    required
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    placeholder="e.g. Modern Physics Lecture Notes"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Subject</label>
                                <input
                                    required
                                    value={newMaterial.subject}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                                    placeholder="Physics"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Resource Type</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                >
                                    <option value="link">Website Link</option>
                                    <option value="pdf">PDF Document</option>
                                    <option value="video">Video Lecture</option>
                                    <option value="doc">Study Doc</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                    {(newMaterial.type === 'pdf' || newMaterial.type === 'doc') ? 'Upload File' : 'Content URL / Link'}
                                </label>

                                {(newMaterial.type === 'pdf' || newMaterial.type === 'doc') ? (
                                    <div
                                        style={{
                                            border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: '10px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            transform: isDragging ? 'scale(1.02)' : 'scale(1)'
                                        }}
                                        onClick={() => document.getElementById('file-upload').click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                            required={!newMaterial.contentUrl}
                                        />
                                        <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                            {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select or drag PDF/Doc here'}
                                        </p>
                                    </div>
                                ) : (
                                    <input
                                        required
                                        value={newMaterial.contentUrl}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, contentUrl: e.target.value })}
                                        placeholder="https://example.com/file.pdf"
                                    />
                                )}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description (Brief Overview)</label>
                                <textarea
                                    value={newMaterial.description}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    placeholder="Tell students what this resource covers..."
                                    style={{ minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ padding: '0.8rem 2.5rem' }}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading & Publishing...' : 'Publish Resource'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        style={{ paddingLeft: '3rem', margin: 0 }}
                        placeholder="Search by title or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Filter size={18} color="var(--primary)" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['all', 'pdf', 'video', 'link'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    background: filterType === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: filterType === type ? 'white' : 'var(--text-muted)',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {}
            {filteredMaterials.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No materials found matching your criteria.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredMaterials.map((material, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={material._id}
                            className="glass-card material-card"
                            style={{ padding: '1.5rem', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    {getIcon(material.type)}
                                </div>
                                {user.user.role === 'teacher' && (
                                    <button onClick={() => handleDelete(material._id)} style={{ color: 'var(--error)', background: 'transparent' }}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{material.title}</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                                {material.subject}
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '40px' }}>
                                {material.description || 'Quick refresher on this topic.'}
                            </p>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    By {material.teacher?.name}
                                </span>
                                <a
                                    href={material.contentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>Access</span>
                                    <ArrowRight size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
                .material-card {
                    transition: transform 0.2s, border-color 0.2s;
                }
                .material-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                }
            `}</style>

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

export default StudyMaterials;

