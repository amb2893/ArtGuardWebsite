"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { RatingTimeSeriesPoint } from "../../../lib/types";

// Register Chart.js components (required by Chart.js v4+)
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Props {
    websiteId: number;
}

type Granularity = "daily" | "weekly" | "monthly";
type ExtendedGranularity = Granularity | "yearly" | "all";

type FillStep = "month";

function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addOneMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function fillSeriesToToday(points: RatingTimeSeriesPoint[], step: FillStep): RatingTimeSeriesPoint[] {
    if (points.length === 0) return points;

    const sorted = [...points].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const countsByMonth = new Map<string, { positive_count: number; negative_count: number }>();
    for (const p of sorted) {
        const bucket = getMonthStart(new Date(p.date));
        const key = monthKey(bucket);
        const existing = countsByMonth.get(key);
        if (existing) {
            existing.positive_count += p.positive_count;
            existing.negative_count += p.negative_count;
        } else {
            countsByMonth.set(key, {
                positive_count: p.positive_count,
                negative_count: p.negative_count,
            });
        }
    }

    const start = getMonthStart(new Date(sorted[0].date));
    const end = getMonthStart(new Date());
    const filled: RatingTimeSeriesPoint[] = [];

    if (step === "month") {
        for (let cursor = new Date(start); cursor <= end; cursor = addOneMonth(cursor)) {
            const key = monthKey(cursor);
            const counts = countsByMonth.get(key);
            filled.push({
                date: cursor.toISOString(),
                positive_count: counts?.positive_count ?? 0,
                negative_count: counts?.negative_count ?? 0,
            });
        }
    }

    return filled;
}

export default function RatingsChart({ websiteId }: Props) {
    const [data, setData] = useState<RatingTimeSeriesPoint[]>([]);
    const [granularity, setGranularity] = useState<ExtendedGranularity>("monthly");
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

    const fullSeriesData =
        granularity === "yearly" || granularity === "all"
            ? fillSeriesToToday(data, "month")
            : data;

    const yearlyWindowStartIndex =
        granularity === "yearly"
            ? Math.max(0, fullSeriesData.length - 12)
            : 0;

    const displayData =
        granularity === "yearly"
            ? fullSeriesData.slice(yearlyWindowStartIndex)
            : fullSeriesData;

    // Format dates for the X-axis labels
    const labels = displayData.map((point) => {
        const d = new Date(point.date);
        if (granularity === "daily") {
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (granularity === "weekly") {
            return "Week of " + d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (granularity === "monthly") {
            return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        } else if (granularity === "yearly") {
            return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        } else {
            return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        }
    });

    // Build cumulative totals so the line shows running totals over time
    let cumulativePositive = 0;
    let cumulativeNegative = 0;
    const cumulativeSeries = fullSeriesData.map((point) => {
        cumulativePositive += point.positive_count;
        cumulativeNegative += point.negative_count;
        return {
            positive: cumulativePositive,
            negative: cumulativeNegative,
        };
    });

    const positiveValues = cumulativeSeries
        .slice(yearlyWindowStartIndex)
        .map((point) => point.positive);
    const negativeValues = cumulativeSeries
        .slice(yearlyWindowStartIndex)
        .map((point) => point.negative);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Positive Ratings",
                data: positiveValues,
                borderColor: "#22c55e",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: "Negative Ratings",
                data: negativeValues,
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                fill: true,
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
                <div className="ratings-chart-toggle">
                    {([
                        ["daily", "Daily"],
                        ["weekly", "Weekly"],
                        ["monthly", "Monthly"],
                        ["yearly", "Yearly"],
                        ["all", "All Time"],
                    ] as Array<[ExtendedGranularity, string]>).map(([g, label]) => (
                        <button
                            key={g}
                            onClick={() => setGranularity(g)}
                            className={`chart-toggle-btn ${granularity === g ? "chart-toggle-active" : ""}`}
                        >
                            {label}
                        </button>
                    ))}
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
                        <Line data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
}