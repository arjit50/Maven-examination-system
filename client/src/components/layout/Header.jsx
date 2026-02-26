import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Trophy, Book, User, GraduationCap } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const headerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".logo", {
            x: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .from(".nav-item, .btn-login, .btn-signup, .user-profile-link, .btn-logout", {
                y: -20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.4");
    }, { scope: headerRef });

    return (
        <header ref={headerRef} className="header glass-card">
            <div className="container header-content">
                <Link to="/" className="logo">
                    <GraduationCap size={32} />
                    <span>Maven Exam</span>
                </Link>
                <nav className="nav-links">
                    <ThemeToggle />
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-item">
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </Link>
                            {user.user.role === 'student' && (
                                <Link to="/my-results" className="nav-item">
                                    <Trophy size={20} />
                                    <span>My Results</span>
                                </Link>
                            )}
                            <Link to="/materials" className="nav-item">
                                <Book size={20} />
                                <span>Materials</span>
                            </Link>
                            <Link to="/profile" className="user-profile-link">
                                <div className="user-profile">
                                    <User size={20} />
                                    <span className="user-name">{user.user.name}</span>
                                    <span className="user-role">({user.user.role})</span>
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/register" className="btn-primary btn-signup">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;

