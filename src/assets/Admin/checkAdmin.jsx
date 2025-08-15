// src/utils/checkAdmin.js
const checkAdmin = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return { ok: false, reason: "NO_TOKEN" };

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/get-profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        
        if (!res.ok) return { ok: false, reason: "INVALID_TOKEN" };

        const data = await res.json();
        
        // อนุญาตเฉพาะ admin
        if (data.user.role !== "admin") {
            return { ok: false, reason: "NOT_ADMIN" };
        }

        return { ok: true, user: data.user };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { ok: false, reason: "ERROR" };
    }
};

export default checkAdmin;
