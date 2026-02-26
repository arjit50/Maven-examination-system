import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MessageCircle, X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hello! I'm your Maven Assistant. How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const chatbotRef = useRef(null);
    const buttonRef = useRef(null);
    const messagesAreaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);


    useGSAP(() => {
        if (isOpen) {

            gsap.fromTo(chatbotRef.current,
                { opacity: 0, scale: 0.5, y: 100, transformOrigin: 'bottom right' },
                { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
            );


            const messageElements = messagesAreaRef.current?.children;
            if (messageElements) {
                gsap.from(messageElements, {
                    opacity: 0,
                    x: -30,
                    stagger: 0.1,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }



            gsap.to(".bot-icon-container", {
                rotate: 15,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, [isOpen]);


    useGSAP(() => {
        if (!isOpen) {
            gsap.to(buttonRef.current, {
                y: "-=10",
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        } else {
            gsap.killTweensOf(buttonRef.current);
            gsap.to(buttonRef.current, { y: 0, duration: 0.3 });
        }
    }, [isOpen]);

    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: textToSend,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        if (!textOverride) setInputValue('');
        setIsTyping(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/chatbot/chat', {
                message: userMessage.text,
                history: messages.slice(-5)
            });

            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Chatbot API error:', error);
            const errorResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: "I'm having trouble connecting to my brain right now. Please try again later.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {isOpen && (
                <div
                    ref={chatbotRef}
                    className="glass-card"
                    style={{
                        width: 'min(380px, 85vw)',
                        height: 'min(550px, calc(100vh - 180px))',
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid var(--primary)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        visibility: isOpen ? 'visible' : 'hidden'
                    }}
                >
                    {}
                    <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="bot-icon-container" style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '10px' }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Maven Assistant</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }}></div>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button onClick={() => {
                            gsap.to(chatbotRef.current, {
                                opacity: 0,
                                scale: 0.8,
                                y: 50,
                                duration: 0.3,
                                onComplete: () => setIsOpen(false)
                            });
                        }} style={{ background: 'transparent', color: 'white', padding: '0.5rem' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {}
                    <div ref={messagesAreaRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'transparent' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: msg.type === 'user' ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                                    background: msg.type === 'user' ? 'var(--primary)' : 'var(--surface)',
                                    color: msg.type === 'user' ? 'white' : 'var(--text)',
                                    fontSize: '0.9rem',
                                    boxShadow: 'var(--shadow)',
                                    border: msg.type === 'bot' ? '1px solid var(--border)' : 'none'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                    {msg.timestamp}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="typing-indicator" style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem' }}>
                                <div style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }} />
                                <div style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }} />
                                <div style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    {}
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                style={{
                                    padding: '0.8rem 3.5rem 0.8rem 1rem',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => handleSend()}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '0.5rem',
                                    borderRadius: '8px'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(var(--primary-rgb), 0.5)',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <Sparkles size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default Chatbot;

