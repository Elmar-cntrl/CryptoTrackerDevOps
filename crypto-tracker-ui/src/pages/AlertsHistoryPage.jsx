import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAlerts, getAlerts } from "../api/alertsApi";

export default function AlertsHistoryPage() {
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAlerts = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (err) {
            setError(err.response?.data || "Error loading alerts");
        }

        setLoading(false);
    };

    const handleClear = async () => {
        try {
            await clearAlerts();
            setAlerts([]);
        } catch (err) {
            alert(err.response?.data || "Clear error");
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <span style={styles.title}>Alerts history</span>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button style={styles.btnGhost} onClick={() => navigate("/dashboard")}>
                            ← Back
                        </button>
                        <button style={styles.btnBlue} onClick={loadAlerts}>
                            Refresh
                        </button>
                        <button style={styles.btnRed} onClick={handleClear}>
                            Clear
                        </button>
                    </div>
                </div>

                {loading && <p style={styles.muted}>Loading...</p>}

                {error && (
                    <p style={{ ...styles.muted, color: "#e07a7a" }}>
                        {error}
                    </p>
                )}

                {!loading && alerts.length === 0 && (
                    <p style={{ ...styles.muted, textAlign: "center", padding: "48px 0" }}>
                        Нет алертов...
                    </p>
                )}

                <div style={styles.list}>
                    {alerts.map((a) => (
                        <div key={a.id} style={styles.item}>
                            <div style={styles.itemTop}>
                                <span style={styles.sym}>{a.symbol}</span>
                                <span style={styles.typeBadge}>{a.type}</span>
                            </div>

                            <div style={styles.prices}>
                                <div style={styles.priceChip}>
                                    <div style={styles.priceLabel}>Jupiter</div>
                                    <div style={styles.priceVal}>{a.jupiterPrice}</div>
                                </div>

                                <div style={styles.priceChip}>
                                    <div style={styles.priceLabel}>MEXC</div>
                                    <div style={styles.priceVal}>{a.mexcPrice}</div>
                                </div>

                                <div style={{ ...styles.priceChip, flex: "0 0 auto", minWidth: 90 }}>
                                    <div style={styles.priceLabel}>Spread</div>
                                    <div style={{ ...styles.priceVal, color: "#22c55e", fontWeight: 500 }}>
                                        {a.spreadPercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            <div style={styles.time}>
                                {new Date(a.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
        maxWidth: 680,
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
        marginBottom: 8,
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },
    item: {
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 10,
        padding: "13px 15px",
    },
    itemTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sym: {
        fontSize: 15,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: ".3px",
    },
    typeBadge: {
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 12,
        background: "#0a1628",
        border: "0.5px solid #1e3352",
        color: "#5a8ab8",
    },
    prices: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
    },
    priceChip: {
        flex: 1,
        background: "#0a1628",
        border: "0.5px solid #1a2e48",
        borderRadius: 8,
        padding: "7px 10px",
    },
    priceLabel: {
        fontSize: 10,
        color: "#3a5472",
        textTransform: "uppercase",
        letterSpacing: ".6px",
        marginBottom: 2,
    },
    priceVal: {
        fontSize: 13,
        fontWeight: 500,
        color: "#c5d4e8",
    },
    time: {
        fontSize: 11,
        color: "#3a5472",
    },
    btnBlue: {
        padding: "7px 14px",
        borderRadius: 8,
        border: "0.5px solid #1a4070",
        background: "#0e2a4d",
        color: "#7ab3e8",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
    btnRed: {
        padding: "7px 14px",
        borderRadius: 8,
        border: "0.5px solid #4a1a1a",
        background: "#2a0e0e",
        color: "#e07a7a",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
    btnGhost: {
        padding: "7px 14px",
        borderRadius: 8,
        border: "0.5px solid #1a2e48",
        background: "transparent",
        color: "#4a6a90",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
};