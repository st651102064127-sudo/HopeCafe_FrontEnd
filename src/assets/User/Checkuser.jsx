const checkUser = async () => {
  try {
    const token = localStorage.getItem("token");
        console.log("User role:", token);

    
    if (!token) {
      console.log(token);
      window.location = '/';
      return { ok: false };
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/get-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      window.location = '/';
      return { ok: false };
    }

    const data = await res.json();

    // อนุญาตเฉพาะ admin และ user
    if (data.user.role !== "admin" && data.user.role !== "staff") {

      window.location = '/';
      return { ok: false };
    }

    return { ok: true, user: data.user };
  } catch (error) {
    console.error("Error fetching user:", error);
    window.location = '/';
    return { ok: false };
  }
};

export default checkUser;
