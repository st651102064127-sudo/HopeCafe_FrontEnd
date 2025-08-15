const checkUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location = '/login';
      return { ok: false };
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/get-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      window.location = '/login';
      return { ok: false };
    }

    const data = await res.json();
    console.log("User role:", data.user.role);

    // อนุญาตเฉพาะ admin และ user
    if (data.user.role !== "admin" && data.user.role !== "user") {
      window.location = '/login';
      return { ok: false };
    }

    return { ok: true, user: data.user };
  } catch (error) {
    console.error("Error fetching user:", error);
    window.location = '/login';
    return { ok: false };
  }
};

export default checkUser;
