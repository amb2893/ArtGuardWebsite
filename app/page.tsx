"use client"; // must be the very first line

import React, { useState } from "react";
import "../styles/globals.css";

export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <>
            <div className="homepage-container">
                <div className="homepage-left">
                    <h1>
                        DEFEND YOUR <span className="accent">CREATIVE</span> WORK
                    </h1>
                    <p className="homepage-desc">
                        ArtGuard protects artists from unauthorized AI training.<br />
                        Expose scrapers, educate creators, and defend your rights in an evolving digital landscape.
                    </p>
                    <div className="homepage-buttons">
                        <button className="btn-primary">START PROTECTING NOW →</button>
                        <button className="btn-secondary">▶ WATCH DEMO</button>
                    </div>
                </div>
                <div className="homepage-right">
                    <div className="protection-card">
                        <div className="protection-header">
                            <h2>PROTECTION ACTIVE</h2>
                            <span className="live-badge">LIVE</span>
                        </div>
                        <div className="protection-content">
                            <div className="protection-item">
                                <div className="protection-icon">🛡️</div>
                                <div className="protection-text">
                                    <p className="protection-number">1,247 Artworks Protected</p>
                                    <p className="protection-subtext">Last scan: 2 minutes ago</p>
                                </div>
                                <div className="checkmark">✓</div>
                            </div>
                            <div className="protection-item threat">
                                <div className="threat-icon">🔔</div>
                                <div className="protection-text">
                                    <p className="protection-number">3 New Threats Blocked</p>
                                    <p className="protection-subtext">Today at 2:34 PM</p>
                                </div>
                                <div className="threat-badge">3</div>
                            </div>
                            <div className="protection-item community">
                                <div className="community-icon">📈</div>
                                <div className="protection-text">
                                    <p className="protection-number">Community Growing</p>
                                    <p className="protection-subtext">+2,341 artists this week</p>
                                </div>
                                <div className="arrow">›</div>
                            </div>
                        </div>
                        <button className="btn-dashboard">👁 VIEW DASHBOARD</button>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">50K+</div>
                        <div className="stat-label">PROTECTED ARTISTS</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number accent-pink">2.4M</div>
                        <div className="stat-label">ARTWORKS MONITORED</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number accent-yellow">99.7%</div>
                        <div className="stat-label">DETECTION RATE</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">24/7</div>
                        <div className="stat-label">ACTIVE PROTECTION</div>
                    </div>
                </div>
            </div>

            <div className="tools-section">
                <h2 className="tools-heading">POWERFUL PROTECTION TOOLS</h2>
                <p className="tools-subheading">Everything you need to defend your creative work from unauthorized AI training and web scraping</p>
            </div>
        </>
    );
}
