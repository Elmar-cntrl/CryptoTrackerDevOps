import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateTokenPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [jupiterId, setJupiterId] = useState("");
    const [mexcSymbol, setMexcSymbol] = useState("");

    const createToken = async () => {
        try {
            await api.post("/api/admin/tokens", {
                name,
                symbol,
                jupiterId,
                mexcSymbol,
            });

            alert("Token created successfully!");
            navigate("/tokens");
        } catch (err) {
            console.error(err);
            alert(err.response?.data || "Error creating token");
        }
    };

    return (
        <div style={styles.wrap}>
            <div style={styles.page}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Add new token</h2>

                    <button
                        style={styles.btnGhost}
                        onClick={() => navigate("/tokens")}
                    >
                        ← Back
                    </button>
                </div>

                <div style={styles.form}>
                    <Field label="Name" value={name} onChange={setName} />
                    <Field label="Symbol" value={symbol} onChange={setSymbol} />
                    <Field label="JupiterId" value={jupiterId} onChange={setJupiterId} />
                    <Field label="MexcSymbol" value={mexcSymbol} onChange={setMexcSymbol} />

                    <button style={styles.btnBlue} onClick={createToken}>
                        Create token
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div style={styles.field}>
            <label style={styles.label}>{label}</label>

            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
    },
    page: {
        width: "100%",
        maxWidth: 600,
        padding: "40px 28px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 500,
        color: "#e8edf5",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
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
        padding: "10px 12px",
        borderRadius: 8,
        border: "0.5px solid #1a2e48",
        background: "#0d1c30",
        color: "#e8edf5",
        fontSize: 13,
        outline: "none",
    },
    btnBlue: {
        padding: "10px 0",
        borderRadius: 8,
        border: "0.5px solid #1a4070",
        background: "#0e2a4d",
        color: "#7ab3e8",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        marginTop: 8,
    },
    btnGhost: {
        padding: "8px 12px",
        borderRadius: 8,
        border: "0.5px solid #1a2e48",
        background: "transparent",
        color: "#4a6a90",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
    },
};