"use client"; // must be the very first line

import React, { useState } from "react";

export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Welcome to ArtGuard</h1>
            <p>Counter: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
