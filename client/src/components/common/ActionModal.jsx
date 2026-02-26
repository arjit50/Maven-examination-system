import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from 'lucide-react';

const ActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info', 
    confirmText = 'OK',
    cancelText = 'Cancel'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={48} color="var(--success)" />;
            case 'error': return <AlertCircle size={48} color="var(--error)" />;
            case 'confirm': return <HelpCircle size={48} color="var(--primary)" />;
            default: return <Info size={48} color="var(--primary)" />;
        }
    };

    const getPrimaryColor = () => {
        switch (type) {
            case 'success': return 'var(--success)';
            case 'error': return 'var(--error)';
            default: return 'var(--primary)';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-card"
                        style={{
                            maxWidth: '400px',
                            width: '90%',
                            padding: '2.5rem',
                            textAlign: 'center',
                            position: 'relative',
                            border: `1px solid ${getPrimaryColor()}`
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                right: '1.5rem',
                                top: '1.5rem',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            background: `rgba(${type === 'error' ? '239, 68, 68' : type === 'success' ? '16, 185, 129' : '99, 102, 241'}, 0.1)`,
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            {getIcon()}
                        </div>

                        <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>{title}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            {type === 'confirm' && (
                                <button
                                    onClick={onClose}
                                    className="btn-secondary"
                                    style={{ flex: 1, padding: '0.75rem' }}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: getPrimaryColor(),
                                    borderColor: getPrimaryColor()
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ActionModal;

