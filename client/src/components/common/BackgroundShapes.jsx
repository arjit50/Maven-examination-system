import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Book, GraduationCap, Pencil, Lightbulb, School, Award, Brain, Microscope } from 'lucide-react';

const BackgroundShapes = () => {
    const containerRef = useRef(null);

    const icons = [
        { Icon: Book, size: 40 },
        { Icon: GraduationCap, size: 50 },
        { Icon: Pencil, size: 30 },
        { Icon: Lightbulb, size: 45 },
        { Icon: School, size: 55 },
        { Icon: Award, size: 35 },
        { Icon: Brain, size: 42 },
        { Icon: Microscope, size: 48 },
    ];


    const shapes = Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        ...icons[i % icons.length],
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 15
    }));

    useGSAP(() => {
        const elements = containerRef.current.querySelectorAll('.floating-shape');

        elements.forEach((el, i) => {

            gsap.to(el, {
                x: "random(-100, 100)",
                y: "random(-100, 100)",
                rotation: "random(-360, 360)",
                duration: shapes[i].duration,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: shapes[i].delay
            });


            gsap.to(el, {
                opacity: 0.6,
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        });
    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
                opacity: 1
            }}
        >
            {shapes.map((shape) => (
                <div
                    key={shape.id}
                    className="floating-shape"
                    style={{
                        position: 'absolute',
                        top: shape.top,
                        left: shape.left,
                        color: 'var(--primary)',
                        opacity: 0.3,
                    }}
                >
                    <shape.Icon size={shape.size} strokeWidth={1.5} />
                </div>
            ))}
        </div>
    );
};

export default BackgroundShapes;

