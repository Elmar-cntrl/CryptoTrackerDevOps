import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip
);

export default function MyTradesPage() {
    const navigate = useNavigate();

    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [tokenId, setTokenId] = useState("");
    const [startAmount, setStartAmount] = useState("");
    const [endAmount, setEndAmount] = useState("");
    const [buyExchange, setBuyExchange] = useState("");
    const [sellExchange, setSellExchange] = useState("");

    useEffect(() => {
        loadTrades();
    }, []);

    async function loadTrades() {
        try {
            const response = await api.get("/api/trades");
            setTrades(response.data);
        } catch (err) {
            console.error(err);
            alert("Error loading trades");
        }

        setLoading(false);
    }

    async function createTrade() {
        try {
            await api.post("/api/trades", {
                tokenId,
                startAmount,
                endAmount,
                buyExchange,
                sellExchange,
            });

            setShowModal(false);

            setTokenId("");
            setStartAmount("");
            setEndAmount("");
            setBuyExchange("");
            setSellExchange("");

            loadTrades();
        } catch (err) {
            console.error(err);
            alert("Error creating trade");
        }
    }

    async function deleteTrade(id) {
        if (!window.confirm("Delete trade?")) return;

        try {
            await api.delete(`/api/trades/${id}`);
            loadTrades();
        } catch (err) {
            console.error(err);
            alert("Error deleting trade");
        }
    }

    const sortedTrades = [...trades].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    let cumulative = 0;

    const chartLabels = sortedTrades.map((t) =>
        new Date(t.createdAt).toLocaleDateString()
    );

    const chartData = sortedTrades.map((t) => {
        cumulative += parseFloat(t.profitAmount) || 0;
        return parseFloat(cumulative.toFixed(4));
    });

    const isPositive =
        chartData.length === 0 ||
        chartData[chartData.length - 1] >= 0;

    const lineColor = isPositive ? "#22c55e" : "#e07a7a";

    const chartConfig = {
        labels: chartLabels,
        datasets: [
            {
                data: chartData,
                borderColor: lineColor,
                borderWidth: 1.5,
                pointRadius: chartData.length > 20 ? 0 : 3,
                pointBackgroundColor: lineColor,
                fill: true,
                backgroundColor: (ctx) => {
                    const canvas = ctx.chart.ctx;
                    const gradient = canvas.createLinearGradient(0, 0, 0, 200);

                    gradient.addColorStop(
                        0,
                        isPositive
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(224,122,122,0.15)"
                    );

                    gradient.addColorStop(1, "rgba(0,0,0,0)");

                    return gradient;
                },
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0a1628",
                borderColor: "#1a2e48",
                borderWidth: 1,
                titleColor: "#4a6a90",
                bodyColor: "#e8edf5",
                callbacks: {
                    label: (ctx) =>
                        ` ${ctx.parsed.y >= 0 ? "+" : ""}${ctx.parsed.y}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "#111e30" },
                ticks: {
                    color: "#3a5472",
                    font: { size: 11 },
                    maxTicksLimit: 8,
                },
                border: { color: "#1a2e48" },
            },
            y: {
                grid: { color: "#111e30" },
                ticks: {
                    color: "#3a5472",
                    font: { size: 11 },
                    callback: (v) => `${v >= 0 ? "+" : ""}${v}`,
                },
                border: { color: "#1a2e48" },
            },
        },
    };

    const totalProfit = chartData.length
        ? chartData[chartData.length - 1]
        : 0;

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <span style={styles.title}>My trades</span>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={styles.btnGhost}
                            onClick={() => navigate("/dashboard")}
                        >
                            ← Back
                        </button>

                        <button
                            style={styles.btnGreen}
                            onClick={() => setShowModal(true)}
                        >
                            + Add trade
                        </button>
                    </div>
                </div>

                {loading && <p style={styles.muted}>Loading...</p>}

                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            {[
                                "Token",
                                "Start",
                                "End",
                                "Profit",
                                "%",
                                "Buy",
                                "Sell",
                                "Date",
                                "",
                            ].map((h) => (
                                <th key={h} style={styles.th}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {sortedTrades.map((trade) => (
                            <tr key={trade.id} style={styles.row}>
                                <td style={styles.td}>
                                        <span style={styles.symBadge}>
                                            {trade.symbol}
                                        </span>
                                </td>

                                <td style={styles.td}>
                                    {trade.startAmount}
                                </td>

                                <td style={styles.td}>
                                    {trade.endAmount}
                                </td>

                                <td
                                    style={{
                                        ...styles.td,
                                        color:
                                            trade.profitAmount > 0
                                                ? "#22c55e"
                                                : "#e07a7a",
                                        fontWeight: 500,
                                    }}
                                >
                                    {trade.profitAmount > 0 ? "+" : ""}
                                    {trade.profitAmount}
                                </td>

                                <td
                                    style={{
                                        ...styles.td,
                                        color:
                                            trade.profitPercent > 0
                                                ? "#22c55e"
                                                : "#e07a7a",
                                    }}
                                >
                                    {trade.profitPercent}%
                                </td>

                                <td style={styles.td}>
                                        <span style={styles.exBadge}>
                                            {trade.buyExchange}
                                        </span>
                                </td>

                                <td style={styles.td}>
                                        <span style={styles.exBadge}>
                                            {trade.sellExchange}
                                        </span>
                                </td>

                                <td
                                    style={{
                                        ...styles.td,
                                        color: "#3a5472",
                                        fontSize: 11,
                                    }}
                                >
                                    {new Date(
                                        trade.createdAt
                                    ).toLocaleString()}
                                </td>

                                <td style={styles.td}>
                                    <button
                                        style={styles.delBtn}
                                        onClick={() =>
                                            deleteTrade(trade.id)
                                        }
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {!loading && trades.length === 0 && (
                        <p
                            style={{
                                ...styles.muted,
                                textAlign: "center",
                                padding: "32px 0",
                            }}
                        >
                            Нет сделок...
                        </p>
                    )}
                </div>

                {trades.length > 0 && (
                    <div style={styles.chartWrap}>
                        <div style={styles.chartHeader}>
                            <span style={styles.chartTitle}>
                                Cumulative profit
                            </span>

                            <span
                                style={{
                                    ...styles.chartTotal,
                                    color:
                                        totalProfit >= 0
                                            ? "#22c55e"
                                            : "#e07a7a",
                                }}
                            >
                                {totalProfit >= 0 ? "+" : ""}
                                {totalProfit}
                            </span>
                        </div>

                        <div style={{ height: 200 }}>
                            <Line
                                data={chartConfig}
                                options={chartOptions}
                            />
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <span style={styles.modalTitle}>Add trade</span>

                        {[
                            {
                                ph: "Token ID",
                                val: tokenId,
                                set: setTokenId,
                            },
                            {
                                ph: "Start amount",
                                val: startAmount,
                                set: setStartAmount,
                            },
                            {
                                ph: "End amount",
                                val: endAmount,
                                set: setEndAmount,
                            },
                            {
                                ph: "Buy exchange",
                                val: buyExchange,
                                set: setBuyExchange,
                            },
                            {
                                ph: "Sell exchange",
                                val: sellExchange,
                                set: setSellExchange,
                            },
                        ].map(({ ph, val, set }) => (
                            <input
                                key={ph}
                                placeholder={ph}
                                value={val}
                                onChange={(e) => set(e.target.value)}
                                style={styles.input}
                            />
                        ))}

                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button style={styles.btnBlue} onClick={createTrade}>
                                Save
                            </button>

                            <button
                                style={styles.btnGhost}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    wrap: {
        minHeight: "100vh",
        background: "#0a1628",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 24,
    },
    page: {
        width: "100%",
        maxWidth: 960,
        padding: "40px 0",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: "-.3px",
    },
    muted: {
        fontSize: 13,
        color: "#3a5472",
    },
    tableWrap: {
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 14,
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13,
        textAlign: "center",
    },
    th: {
        padding: "11px 10px",
        borderBottom: "0.5px solid #1a2e48",
        color: "#3a5472",
        fontWeight: 500,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: ".5px",
        background: "#0a1628",
    },
    row: {
        transition: "background .12s",
    },
    td: {
        padding: "10px 10px",
        borderBottom: "0.5px solid #111e30",
        color: "#c5d4e8",
    },
    symBadge: {
        background: "#0a1628",
        border: "0.5px solid #1a2e48",
        borderRadius: 7,
        padding: "3px 9px",
        fontSize: 12,
        fontWeight: 500,
        color: "#7ab3e8",
    },
    exBadge: {
        background: "#0a1628",
        border: "0.5px solid #1a2e48",
        borderRadius: 7,
        padding: "3px 8px",
        fontSize: 11,
        color: "#4a6a90",
    },
    delBtn: {
        background: "#2a0e0e",
        border: "0.5px solid #4a1a1a",
        color: "#e07a7a",
        borderRadius: 6,
        padding: "4px 9px",
        fontSize: 12,
        cursor: "pointer",
    },
    chartWrap: {
        marginTop: 12,
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 14,
        padding: "18px 20px",
    },
    chartHeader: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 13,
        color: "#4a6a90",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: ".5px",
    },
    chartTotal: {
        fontSize: 20,
        fontWeight: 500,
        letterSpacing: "-.3px",
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
    },
    modal: {
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 14,
        padding: "24px 22px",
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 500,
        color: "#e8edf5",
    },
    input: {
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "0.5px solid #1a2e48",
        background: "#0a1628",
        color: "#e8edf5",
        fontSize: 13,
        outline: "none",
    },
    btnBlue: {
        flex: 1,
        padding: "8px 0",
        borderRadius: 8,
        border: "0.5px solid #1a4070",
        background: "#0e2a4d",
        color: "#7ab3e8",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
    btnGreen: {
        padding: "7px 16px",
        borderRadius: 8,
        border: "0.5px solid #154030",
        background: "#0a2818",
        color: "#4ead7a",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
    btnGhost: {
        flex: 1,
        padding: "8px 0",
        borderRadius: 8,
        border: "0.5px solid #1a2e48",
        background: "transparent",
        color: "#4a6a90",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
};