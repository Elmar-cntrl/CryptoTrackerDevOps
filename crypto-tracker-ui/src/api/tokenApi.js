import api from "./axios";

export async function getAllTokens() {
    const response = await api.get("/api/user/tokens/all");
    return response.data;
}