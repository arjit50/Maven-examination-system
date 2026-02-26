import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CursorFollower = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;

        const onMouseMove = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });

            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: "power3.out"
            });
        };

        const onMouseEnter = () => {
            gsap.to(follower, { scale: 2, duration: 0.3 });
            gsap.to(cursor, { scale: 0.5, duration: 0.3 });
        };

        const onMouseLeave = () => {
            gsap.to(follower, { scale: 1, duration: 0.3 });
            gsap.to(cursor, { scale: 1, duration: 0.3 });
        };

        window.addEventListener('mousemove', onMouseMove);

        const interactives = document.querySelectorAll('button, a, input, select, .glass-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', onMouseEnter);
            el.addEventListener('mouseleave', onMouseLeave);
        });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            interactives.forEach(el => {
                el.removeEventListener('mouseenter', onMouseEnter);
                el.removeEventListener('mouseleave', onMouseLeave);
            });
        };
    }, []);

    return (
        <div style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: 99999 }}>

            <div
                ref={cursorRef}
                style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px var(--primary)'
                }}
            />

            <div
                ref={followerRef}
                style={{
                    position: 'absolute',
                    width: '35px',
                    height: '35px',
                    border: '1px solid var(--primary)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.5,
                    mixBlendMode: 'difference'
                }}
            />
        </div>
    );
};

export default CursorFollower;

