import api from "./axios";

export async function registerUser(email, password) {
    const res = await api.post("/Auth/register", {
        email,
        password,
    });

    return res.data;
}

export async function loginUser(email, password) {
    const res = await api.post("/Auth/login", {
        email,
        password,
    });

    return res.data;
}