"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { RatingTimeSeriesPoint } from "../../../lib/types";

// Register Chart.js components (required by Chart.js v4+)
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Props {
    websiteId: number;
}

type Granularity = "monthly" | "yearly" | "all-time";
type ChartType = "line" | "bar";

export default function RatingsChart({ websiteId }: Props) {
    const [data, setData] = useState<RatingTimeSeriesPoint[]>([]);
    const [granularity, setGranularity] = useState<Granularity>("monthly");
    const [chartType, setChartType] = useState<ChartType>("line");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/ratings/${websiteId}/timeseries?granularity=${granularity}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch chart data");
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Could not load chart data.");
                setLoading(false);
            });
    }, [websiteId, granularity]);

    // Format dates for the X-axis labels
    const labels = data.map((point) => {
        if (granularity === "all-time") {
            return "All Time";
        }

        const d = new Date(point.date);
        if (granularity === "monthly") {
            return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        }

        return d.toLocaleDateString("en-US", { year: "numeric" });
    });

    // Build cumulative totals so the line shows running totals over time
    let cumulativePositive = 0;
    let cumulativeNegative = 0;
    const positiveValues = data.map((point) => {
        cumulativePositive += point.positive_count;
        return cumulativePositive;
    });
    const negativeValues = data.map((point) => {
        cumulativeNegative += point.negative_count;
        return cumulativeNegative;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: "Positive Ratings",
                data: positiveValues,
                borderColor: "#22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.45)",
                fill: chartType === "line",
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: "Negative Ratings",
                data: negativeValues,
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.45)",
                fill: chartType === "line",
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: { size: 13, family: "'Manrope', sans-serif" },
                    color: "#1a1a1a",
                    usePointStyle: true,
                    pointStyle: "circle",
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#1a1a1a",
                titleFont: { family: "'Space Grotesk', sans-serif" },
                bodyFont: { family: "'Manrope', sans-serif" },
                cornerRadius: 8,
                padding: 12,
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(0,0,0,0.05)" },
                ticks: {
                    font: { size: 11, family: "'Manrope', sans-serif" },
                    color: "#666",
                },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.05)" },
                ticks: {
                    font: { size: 11, family: "'Manrope', sans-serif" },
                    color: "#666",
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="ratings-chart-card">
            <div className="ratings-chart-header">
                <h2 className="website-card-title">Rating Trends</h2>
                <div>
                    <div className="ratings-chart-toggle" style={{ marginBottom: "0.5rem" }}>
                        {(["monthly", "yearly", "all-time"] as Granularity[]).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`chart-toggle-btn ${granularity === g ? "chart-toggle-active" : ""}`}
                            >
                                {g === "all-time" ? "All Time" : g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="ratings-chart-toggle">
                        {(["line", "bar"] as ChartType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setChartType(type)}
                                className={`chart-toggle-btn ${chartType === type ? "chart-toggle-active" : ""}`}
                            >
                                {type === "line" ? "Line" : "Bar"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ratings-chart-body">
                {loading && <p className="ratings-chart-loading">Loading chart...</p>}
                {error && <p className="ratings-chart-error">{error}</p>}
                {!loading && !error && data.length === 0 && (
                    <p className="ratings-chart-empty">No rating data available yet.</p>
                )}
                {!loading && !error && data.length > 0 && (
                    <div className="ratings-chart-container">
                        {chartType === "line" ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <Bar data={chartData} options={chartOptions} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}