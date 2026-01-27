"use client"; // must be the very first line

import React, { useState } from "react";
import "../styles/globals.css";

export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div className="homepage-container">
            <div className="homepage-left">
                <h1>
                    DEFEND YOUR <span className="accent">CREATIVE</span> WORK
                </h1>
                <p className="homepage-desc">
                    ArtGuard protects artists from unauthorized AI training.<br />
                    Expose scrapers, educate creators, and defend your rights in an evolving digital landscape.
                </p>
            </div>
        </div>
    );
}
