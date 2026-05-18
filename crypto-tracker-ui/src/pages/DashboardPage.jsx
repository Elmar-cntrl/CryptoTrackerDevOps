import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotificationConnection } from "../signalr/notificationConnection";

export default function DashboardPage() {
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState("Connecting...");

    useEffect(() => {
        const connection = createNotificationConnection();

        connection
            .start()
            .then(() => setStatus("Connected"))
            .catch(() => setStatus("Disconnected"));

        connection.on("SpreadAlert", (data) => {
            setAlerts((prev) => [
                { ...data, id: crypto.randomUUID() },
                ...prev,
            ]);
        });

        return () => {
            connection.stop();
        };
    }, []);

    function leaveAccount() {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <span style={styles.title}>Dashboard</span>

                    <div style={styles.headerRight}>
                        <span style={styles.statusBadge}>
                            <span
                                style={{
                                    ...styles.dot,
                                    background:
                                        status === "Connected"
                                            ? "#22c55e"
                                            : "#ef4444",
                                }}
                            />
                            SignalR: {status}
                        </span>

                        <button style={styles.leaveBtn} onClick={leaveAccount}>
                            Leave
                        </button>
                    </div>
                </div>

                <div style={styles.navGrid}>
                    {[
                        {
                            label: "Tokens",
                            path: "/tokens",
                            bg: "#0e2a4d",
                            border: "#1a4070",
                            color: "#7ab3e8",
                        },
                        {
                            label: "My tokens",
                            path: "/my-tokens",
                            bg: "#1a0e35",
                            border: "#2e1a5a",
                            color: "#a78bdf",
                        },
                        {
                            label: "My trades",
                            path: "/my-trades",
                            bg: "#0a2818",
                            border: "#154030",
                            color: "#4ead7a",
                        },
                        {
                            label: "History",
                            path: "/history",
                            bg: "#2a1500",
                            border: "#4a2800",
                            color: "#e0933a",
                        },
                    ].map(({ label, path, bg, border, color }) => (
                        <button
                            key={path}
                            style={{
                                ...styles.navBtn,
                                background: bg,
                                borderColor: border,
                                color,
                            }}
                            onClick={() => navigate(path)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div style={styles.alertsBox}>
                    <div style={styles.alertsHead}>
                        <span style={styles.alertsTitle}>Live alerts</span>
                        <span style={styles.alertsCount}>
                            {alerts.length} alerts
                        </span>
                    </div>

                    <div style={styles.alertsList}>
                        {alerts.length === 0 && (
                            <p style={styles.empty}>
                                Нет уведомлений...
                            </p>
                        )}

                        {alerts.map((a) => (
                            <div key={a.id} style={styles.alertItem}>
                                <div style={styles.alertTop}>
                                    <span style={styles.alertSym}>
                                        {a.tokenSymbol}
                                    </span>
                                    <span style={styles.alertType}>
                                        {a.type}
                                    </span>
                                </div>

                                <div style={styles.priceRow}>
                                    <div style={styles.priceChip}>
                                        <div style={styles.priceLabel}>
                                            Jupiter
                                        </div>
                                        <div style={styles.priceVal}>
                                            {a.jupiterPrice}
                                        </div>
                                    </div>

                                    <div style={styles.priceChip}>
                                        <div style={styles.priceLabel}>
                                            MEXC
                                        </div>
                                        <div style={styles.priceVal}>
                                            {a.mexcPrice}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.alertBottom}>
                                    <span style={styles.spreadTxt}>
                                        Spread:{" "}
                                        <b
                                            style={{
                                                color: "#22c55e",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {a.spreadPercent.toFixed(2)}%
                                        </b>
                                    </span>

                                    <span style={styles.time}>
                                        {new Date(a.time).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
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
    },
    page: {
        width: "100%",
        maxWidth: 640,
        padding: "40px 28px",
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
    },
    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },

    title: {
        fontSize: 22,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: "-.3px",
    },

    statusBadge: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        fontSize: 12,
        color: "#7a8fa8",
        background: "#0f1e35",
        border: "0.5px solid #1e3352",
        padding: "5px 12px",
        borderRadius: 20,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        flexShrink: 0,
        transition: "background .3s",
    },

    leaveBtn: {
        padding: "6px 14px",
        borderRadius: 20,
        border: "0.5px solid #4a1a1a",
        background: "#2a0a0a",
        color: "#ff6b6b",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
    },

    navGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 28,
    },
    navBtn: {
        padding: "11px 8px",
        borderRadius: 10,
        border: "0.5px solid",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },

    alertsBox: {
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 14,
        overflow: "hidden",
    },
    alertsHead: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: "0.5px solid #1a2e48",
    },
    alertsTitle: {
        fontSize: 14,
        fontWeight: 500,
        color: "#c5d4e8",
    },
    alertsCount: {
        fontSize: 11,
        color: "#4a6a90",
        background: "#0a1628",
        padding: "3px 9px",
        borderRadius: 12,
        border: "0.5px solid #1a2e48",
    },

    alertsList: {
        padding: 12,
        maxHeight: 340,
        overflowY: "auto",
    },
    empty: {
        padding: "32px 0",
        textAlign: "center",
        color: "#3a5472",
        fontSize: 13,
    },

    alertItem: {
        background: "#0a1628",
        border: "0.5px solid #1a2e48",
        borderRadius: 10,
        padding: "13px 15px",
        marginBottom: 9,
        animation: "slideIn .35s cubic-bezier(.25,.8,.25,1)",
    },
    alertTop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    alertSym: {
        fontSize: 15,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: ".3px",
    },
    alertType: {
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 12,
        background: "#0f1e35",
        border: "0.5px solid #1e3352",
        color: "#5a8ab8",
    },

    priceRow: {
        display: "flex",
        gap: 10,
        marginBottom: 8,
    },
    priceChip: {
        flex: 1,
        background: "#0d1c30",
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

    alertBottom: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    spreadTxt: {
        fontSize: 13,
        color: "#e8edf5",
    },
    time: {
        fontSize: 11,
        color: "#3a5472",
    },
};