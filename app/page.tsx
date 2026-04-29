"use client"; // must be the very first line

import React, { useState } from "react";
import Link from "next/link";
import "../styles/globals.css";
import PopularThreads from "./components/PopularThreads";
import PopularWebsites from "./components/PopularWebsites";

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
                        ArtGuard empowers artists to protect their art from unauthorized AI training and feel at ease.
                        Join our growing community to learn how to protect yourself, discuss a range of of topics related to art and AI, and
                        review hosting sites based on your own experiences.
                    </p>
                    <div className="homepage-buttons">
                        <Link href="/forums" className="btn-primary">VISIT OUR FORUMS NOW</Link>
                        <Link href="/ratings" className="btn-secondary">LEAVE A REVIEW</Link>
                    </div>
                </div>
                <div className="homepage-right">
                    <div className="protection-card">
                        <div className="protection-header">
                            <h2>WHAT ARTGUARD DOES FOR YOU</h2>
                            <span className="live-badge">LIVE</span>
                        </div>
                        <div className="protection-content">
                            <Link href="/ratings" className="protection-item">
                                <div className="protection-icon">📈</div>
                                <div className="protection-text">
                                    <p className="protection-number">Website Reviews</p>
                                    <p className="protection-subtext">See how sites protect your art</p>
                                </div>
                                <div className="arrow">›</div>
                            </Link>
                            <Link href="/forums" className="protection-item threat">
                                <div className="threat-icon">🔔</div>
                                <div className="protection-text">
                                    <p className="protection-number">Join the Community</p>
                                    <p className="protection-subtext">Join discussions and share feedback</p>
                                </div>
                                <div className="arrow">›</div>
                            </Link>
                            <Link href="/articles" className="protection-item community">
                                <div className="community-icon">📚</div>
                                <div className="protection-text">
                                    <p className="protection-number">Inform Yourself</p>
                                    <p className="protection-subtext">Read articles written by experts and trusted users</p>
                                </div>
                                <div className="arrow">›</div>
                            </Link>
                        </div>
                        <Link href="/signup" className="btn-dashboard">CREATE AN ACCOUNT NOW</Link>
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <div className="stat-number">EDUCATE</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number accent-pink">INFORM</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number accent-yellow">ENABLE</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">EMPOWER</div>
                    </div>
                </div>
            </div>

            <div className="popular-content-section">
                <PopularThreads />
                <PopularWebsites />
            </div>
        </>
    );
}
