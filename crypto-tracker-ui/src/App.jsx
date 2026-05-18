import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TokensPage from "./pages/TokensPage";
import MyTokensPage from "./pages/MyTokensPage";
import MyTradesPage from "./pages/MyTradesPage";
import AlertsHistoryPage from "./pages/AlertsHistoryPage";
import CreateTokenPage from "./pages/CreateTokenPage";



function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />


            <Route path="/tokens" element={<TokensPage />} />


            <Route path="/my-tokens" element={<MyTokensPage />} />


            <Route path="/my-trades" element={<MyTradesPage />} />

            <Route path="/history" element={<AlertsHistoryPage />} />

            <Route path="/admin/tokens/create" element={<CreateTokenPage />} />
        </Routes>
    );
}

export default App;