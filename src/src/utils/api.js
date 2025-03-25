// src/utils/api.js
export function getAuthHeaders() {
    const token = sessionStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}
