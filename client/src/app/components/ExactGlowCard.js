import React from 'react';
import '../css_styles/ExactGlowCard.css';
import usePointerGlow from './usePointerGlow';

const ExactGlowCard = () => {
    const [status] = usePointerGlow();

    return (
        <div className="exact-glow-wrapper">
            <main>
                <article data-glow>
                    <span data-glow />
                    <button data-glow>
                        <span>Glow Up</span>
                    </button>
                </article>
                <article data-glow>
                    <span data-glow />
                    <button data-glow>
                        <span>Glow Up</span>
                    </button>
                </article>
                <article data-glow>
                    <span data-glow />
                    <button data-glow>
                        <span>Glow Up</span>
                    </button>
                </article>
            </main>
        </div>
    );
};

export default ExactGlowCard;
