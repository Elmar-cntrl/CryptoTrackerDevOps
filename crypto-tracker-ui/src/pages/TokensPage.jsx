import { useEffect, useState } from "react";
import { getAllTokens } from "../api/tokenApi";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function TokensPage() {
    const navigate = useNavigate();

    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingToken, setEditingToken] = useState(null);
    const [rightSpread, setRightSpread] = useState(0);
    const [backSpread, setBackSpread] = useState(0);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadTokens();
        checkAdmin();
    }, []);

    async function checkAdmin() {
        try {
            await api.get("/api/admin/users");
            setIsAdmin(true);
        } catch {
            setIsAdmin(false);
        }
    }

    async function loadTokens() {
        try {
            const data = await getAllTokens();
            setTokens(data);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    }

    async function saveTokenSettings() {
        if (!editingToken) return;

        try {
            await api.post("/api/user/tokens", {
                tokenId: editingToken.id,
                rightSpreadPercent: rightSpread,
                backSpreadPercent: backSpread,
            });

            alert(`Token ${editingToken.symbol} added successfully!`);
            setEditingToken(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error saving token");
        }
    }

    async function addAllTokens() {
        try {
            await api.post("/api/user/tokens/activate-all");
            alert("All tokens have been added to tracking!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error adding all tokens");
        }
    }

    async function deleteToken(tokenId, symbol) {
        if (!window.confirm(`Delete token ${symbol}?`)) return;

        try {
            await api.delete(`/api/admin/tokens/${tokenId}`);

            setTokens((prev) => prev.filter((t) => t.id !== tokenId));

            alert(`Token ${symbol} deleted!`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error deleting token");
        }
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <span style={styles.title}>All tokens</span>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={styles.btnGhost}
                            onClick={() => navigate("/dashboard")}
                        >
                            ← Back
                        </button>

                        {isAdmin && (
                            <button
                                style={styles.btnBlue}
                                onClick={() => navigate("/admin/tokens/create")}
                            >
                                + Add new token
                            </button>
                        )}

                        <button
                            style={styles.btnGreen}
                            onClick={addAllTokens}
                        >
                            Add all
                        </button>
                    </div>
                </div>

                {loading && <p style={styles.muted}>Loading...</p>}

                <div style={styles.grid}>
                    {tokens.map((token) => (
                        <div
                            key={token.symbol}
                            style={styles.tokenCard}
                            onClick={() => {
                                setEditingToken(token);
                                setRightSpread(0);
                                setBackSpread(0);
                            }}
                        >
                            {isAdmin && (
                                <button
                                    style={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteToken(token.id, token.symbol);
                                    }}
                                >
                                    ✕
                                </button>
                            )}

                            <span style={styles.sym}>{token.symbol}</span>
                            <span style={styles.name}>{token.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {editingToken && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <span style={styles.modalTitle}>
                            Add — {editingToken.symbol}
                        </span>

                        <Field
                            label="Прямой спред (%)"
                            value={rightSpread}
                            onChange={setRightSpread}
                        />

                        <Field
                            label="Обратный спред (%)"
                            value={backSpread}
                            onChange={setBackSpread}
                        />

                        <div style={styles.modalBtns}>
                            <button
                                style={styles.btnBlue}
                                onClick={saveTokenSettings}
                            >
                                Save
                            </button>

                            <button
                                style={styles.btnGhost}
                                onClick={() => setEditingToken(null)}
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

function Field({ label, value, onChange }) {
    return (
        <div style={styles.field}>
            <label style={styles.label}>{label}</label>

            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={styles.input}
            />
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
        maxWidth: 700,
        padding: "40px 28px",
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
        marginBottom: 16,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 10,
    },

    tokenCard: {
        position: "relative",
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 10,
        padding: "13px 14px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },

    deleteBtn: {
        position: "absolute",
        top: 6,
        right: 8,
        background: "transparent",
        border: "none",
        color: "#ff5c5c",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
    },

    sym: {
        fontSize: 15,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: ".3px",
    },
    name: {
        fontSize: 12,
        color: "#4a6a90",
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
        width: 340,
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: 500,
        color: "#e8edf5",
    },

    modalBtns: {
        display: "flex",
        gap: 8,
        marginTop: 4,
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },

    label: {
        fontSize: 12,
        color: "#4a6a90",
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
        flex: 1,
        padding: "8px 0",
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