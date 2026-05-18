import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function MyTokensPage() {
    const navigate = useNavigate();

    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingToken, setEditingToken] = useState(null);
    const [rightSpread, setRightSpread] = useState(0);
    const [backSpread, setBackSpread] = useState(0);

    const [globalModal, setGlobalModal] = useState(false);
    const [globalRight, setGlobalRight] = useState(0);
    const [globalBack, setGlobalBack] = useState(0);

    useEffect(() => {
        loadTokens();
    }, []);

    async function loadTokens() {
        setLoading(true);

        try {
            const response = await api.get("/api/user/tokens");
            setTokens(response.data);
        } catch (err) {
            console.error(err);
            alert("Error loading tokens");
        }

        setLoading(false);
    }

    async function saveTokenSettings() {
        if (!editingToken) return;

        try {
            await api.put(`/api/user/tokens/${editingToken.tokenId}`, {
                rightSpreadPercent: rightSpread,
                backSpreadPercent: backSpread,
            });

            alert(`Token ${editingToken.symbol} updated successfully!`);
            setEditingToken(null);
            loadTokens();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error updating token");
        }
    }

    async function deleteToken() {
        if (!editingToken) return;

        try {
            await api.delete(`/api/user/tokens/${editingToken.tokenId}`);

            alert(`Token ${editingToken.symbol} deleted successfully!`);
            setEditingToken(null);
            loadTokens();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error deleting token");
        }
    }

    async function deleteAllTokens() {
        if (!window.confirm("Delete all tracked tokens?")) return;

        try {
            await api.delete("/api/user/tokens/deactivate-all");
            alert("All tokens deleted successfully!");
            loadTokens();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error deleting all tokens");
        }
    }

    async function setGlobalSpread() {
        try {
            await api.put("/api/user/tokens/set-global-spread", {
                rightSpreadPercent: globalRight,
                backSpreadPercent: globalBack,
            });

            alert("Global spread updated!");
            setGlobalModal(false);
            loadTokens();
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error updating global spread");
        }
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <span style={styles.title}>My tokens</span>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={styles.btnGreen}
                            onClick={() => setGlobalModal(true)}
                        >
                            Global spread
                        </button>

                        <button
                            style={styles.btnRed}
                            onClick={deleteAllTokens}
                        >
                            Delete all
                        </button>

                        <button
                            style={styles.btnGhost}
                            onClick={() => navigate("/dashboard")}
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {loading && <p style={styles.muted}>Loading...</p>}

                <div style={styles.grid}>
                    {tokens.map((token) => (
                        <div
                            key={token.tokenId}
                            style={styles.tokenCard}
                            onClick={() => {
                                setEditingToken(token);
                                setRightSpread(token.rightSpreadPercent);
                                setBackSpread(token.backSpreadPercent);
                            }}
                        >
                            <span style={styles.sym}>{token.symbol}</span>

                            <div style={styles.spreads}>
                                <span style={styles.spreadChip}>
                                    R:{" "}
                                    <b style={styles.val}>
                                        {token.rightSpreadPercent}%
                                    </b>
                                </span>

                                <span style={styles.spreadChip}>
                                    B:{" "}
                                    <b style={styles.val}>
                                        {token.backSpreadPercent}%
                                    </b>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingToken && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <span style={styles.modalTitle}>
                            Edit — {editingToken.symbol}
                        </span>

                        <Field
                            label="Right spread (%)"
                            value={rightSpread}
                            onChange={setRightSpread}
                        />

                        <Field
                            label="Back spread (%)"
                            value={backSpread}
                            onChange={setBackSpread}
                        />

                        <div style={styles.modalBtns}>
                            <button style={styles.btnBlue} onClick={saveTokenSettings}>
                                Save
                            </button>

                            <button style={styles.btnRed} onClick={deleteToken}>
                                Delete
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

            {globalModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <span style={styles.modalTitle}>Global spread</span>

                        <Field
                            label="Right spread (%)"
                            value={globalRight}
                            onChange={setGlobalRight}
                        />

                        <Field
                            label="Back spread (%)"
                            value={globalBack}
                            onChange={setGlobalBack}
                        />

                        <div style={styles.modalBtns}>
                            <button style={styles.btnBlue} onClick={setGlobalSpread}>
                                Save
                            </button>

                            <button
                                style={styles.btnGhost}
                                onClick={() => setGlobalModal(false)}
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
        background: "#0d1c30",
        border: "0.5px solid #1a2e48",
        borderRadius: 10,
        padding: "13px 14px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
    },

    sym: {
        fontSize: 15,
        fontWeight: 500,
        color: "#e8edf5",
        letterSpacing: ".3px",
    },

    spreads: {
        display: "flex",
        gap: 8,
    },

    spreadChip: {
        flex: 1,
        background: "#0a1628",
        border: "0.5px solid #1a2e48",
        borderRadius: 7,
        padding: "5px 9px",
        fontSize: 11,
        color: "#4a6a90",
    },

    val: {
        color: "#7ab3e8",
        fontWeight: 500,
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

    btnRed: {
        flex: 1,
        padding: "8px 0",
        borderRadius: 8,
        border: "0.5px solid #4a1a1a",
        background: "#2a0e0e",
        color: "#e07a7a",
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