import React, { useState } from "react";
import axios from "axios";
import ErrorMessage from "./Component/errorMessage"; // ถ้ามี component สำหรับแสดง error

const Login = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [errorTrigger, setErrorTrigger] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/login/session`,
            { phone, password },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: false // ไม่ต้องใช้ session cookie ตอนนี้
            }
        );

        const data = response.data;
       
        
        if (data.status === "success") {
            // เก็บ token ใน localStorage
            localStorage.setItem("token", data.token);

            // เก็บข้อมูลผู้ใช้เพิ่มเติมถ้าต้องการ
            localStorage.setItem("user_name", data.user.name);
            localStorage.setItem("user_role", data.user.role);

            if(data.user.role === "admin"){
                 window.location.href = "/food";   
            }else{
                window.location.href = "/queue"
            }
        
        } else {
            // กรณี backend ส่ง status != success
            setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
            setErrorTrigger(prev => prev + 1);
        }
    } catch (err) {
        // กรณี network error หรือ response ไม่ถูกต้อง
        setError(err.response?.data?.message || "เกิดข้อผิดพลาดฝั่ง Server");
        setErrorTrigger(prev => prev + 1);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    เข้าสู่ระบบ
                </h2>

                {error && <ErrorMessage message={error} trigger={errorTrigger} />}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">เบอร์โทร</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="เบอร์โทร"
                            className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="รหัสผ่าน"
                            className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-2xl transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </button>
                </form>

            
            </div>
        </div>
    );
};

export default Login;
