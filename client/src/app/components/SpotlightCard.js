import React from 'react';
import '../css_styles/ExactGlowCard.css';
import '../css_styles/SpotlightCard.css';

export default function SpotlightCard({ project }) {
    const statusClassName = `status-${project.status.replace(/\s/g, '')}`;

    return (
        <article data-glow style={{ width: '100%' }}>
            <span data-glow />
            <div className="card-content">
                <h5 className="card-title">{project.name}</h5>
                <p className="card-location">{project.geographic}</p>

                <div className="property-grid">
                    <div className="property-item">
                        <div className="property-icon">🏭</div>
                        <div className="property-label">{project.productionType}</div>
                    </div>
                    <div className="property-item">
                        <div className="property-icon">⚡</div>
                        <div className={`property-label ${statusClassName}`}>{project.status}</div>
                    </div>
                    <div className="property-item">
                        <div className="property-icon">📅</div>
                        <div className="property-label">{project.projectedYear}</div>
                    </div>
                    <div className="property-item">
                        <div className="property-icon">🔋</div>
                        <div className="property-label">{project.capacity}</div>
                    </div>
                </div>
            </div>
        </article>
    );
}