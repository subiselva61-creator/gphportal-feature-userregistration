import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import '../css_styles/project.css';

const glowColorMap = {
    blue: { base: 220, spread: 200 },
    purple: { base: 280, spread: 300 },
    green: { base: 120, spread: 200 },
    red: { base: 0, spread: 200 },
    orange: { base: 30, spread: 200 }
};

const sizeMap = {
    sm: 'glow-card-sm',
    md: 'glow-card-md',
    lg: 'glow-card-lg'
};

const GlowCard = forwardRef(({
    children,
    className = "",
    style = {},
    glowColor = 'blue',
    size = 'md',
    width,
    height,
    customSize = false,
    ...props
}, ref) => {
    const cardRef = useRef(null);
    const innerRef = useRef(null);

    // Expose the DOM element to parent refs
    useImperativeHandle(ref, () => cardRef.current);

    useEffect(() => {
        const syncPointer = (e) => {
            const { clientX: x, clientY: y } = e;

            if (cardRef.current) {
                cardRef.current.style.setProperty('--x', x.toFixed(2));
                cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
                cardRef.current.style.setProperty('--y', y.toFixed(2));
                cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
            }
        };

        document.addEventListener('pointermove', syncPointer);
        return () => document.removeEventListener('pointermove', syncPointer);
    }, []);

    const { base, spread } = glowColorMap[glowColor];

    // Determine sizing classes
    const getSizeClasses = () => {
        if (customSize) {
            return ''; // Let className or inline styles handle sizing
        }
        return sizeMap[size];
    };

    const getInlineStyles = () => {
        const baseStyles = {
            '--base': base,
            '--spread': spread,
            ...style
        };

        // Add width and height if provided
        if (width !== undefined) {
            baseStyles.width = typeof width === 'number' ? `${width}px` : width;
        }
        if (height !== undefined) {
            baseStyles.height = typeof height === 'number' ? `${height}px` : height;
        }

        return baseStyles;
    };

    return (
        <article
            ref={cardRef}
            className={`glow-card ${getSizeClasses()} ${className}`}
            data-glow
            style={getInlineStyles()}
            {...props}
        >
            <div ref={innerRef} data-glow></div>
            {children}
        </article>
    );
});

export default GlowCard;
