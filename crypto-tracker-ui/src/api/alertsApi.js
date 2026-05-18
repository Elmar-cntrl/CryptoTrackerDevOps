import api from "./axios";

export async function getAlerts() {
    const res = await api.get("/api/alerts");
    return res.data;
}

export async function clearAlerts() {
    const res = await api.delete("/api/alerts/clear");
    return res.data;
}