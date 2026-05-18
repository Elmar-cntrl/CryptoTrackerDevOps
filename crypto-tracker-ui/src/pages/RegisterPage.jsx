import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        setError("");

        try {
            await registerUser(email, password);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data || "Register error");
        }
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>

                <form onSubmit={handleRegister} style={styles.form}>
                    <input
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button style={styles.button} type="submit">
                        Register
                    </button>

                    {error && <p style={styles.error}>{error}</p>}
                </form>

                <p style={styles.linkText}>
                    Уже есть аккаунт? <a style={styles.link} href="/login">Login</a>
                </p>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "Inter, sans-serif",
    },
    card: {
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        width: "320px",
    },
    title: {
        marginBottom: "20px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
    },
    button: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#764ba2",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
    },
    error: {
        color: "red",
        fontSize: "14px",
        textAlign: "center",
    },
    linkText: {
        marginTop: "15px",
        textAlign: "center",
    },
    link: {
        color: "#764ba2",
        textDecoration: "none",
        fontWeight: "600",
    },
};