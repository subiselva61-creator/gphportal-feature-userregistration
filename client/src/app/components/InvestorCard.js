import React from 'react';
import '../css_styles/ExactGlowCard.css';
import '../css_styles/InvestorCard.css';

export default function InvestorCard({ investor }) {
    return (
        <article className="investor-card" data-glow style={{ width: '100%' }}>
            <span data-glow />
            <div className="card-content">
                <div className="investor-header">
                    {investor.logo && (
                        <img
                            src={investor.logo}
                            alt={investor.name + " logo"}
                            className="investor-logo-img"
                        />
                    )}
                    <h5 className="investor-title">{investor.name}</h5>
                </div>
                <p className="investor-country">{investor.country}</p>

                <div className="investor-details">
                    <div className="investor-detail-item">
                        <strong>Investment Size:</strong>
                        <span>{investor.investmentSize}</span>
                    </div>
                    <div className="investor-detail-item">
                        <strong>Strategy:</strong>
                        <span>{investor.strategy}</span>
                    </div>
                    <div className="investor-detail-item">
                        <strong>Conditions:</strong>
                        <span>{investor.conditions}</span>
                    </div>
                    <div className="investor-detail-item">
                        <strong>Notable Activity:</strong>
                        <span>{investor.notableActivity}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}
