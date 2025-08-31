import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import checkAdmin from '../checkAdmin';

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // คุมการโหลดหน้า
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const result = await checkAdmin();

      if (!result.ok) {
        navigate('/login'); // redirect ถ้าไม่ใช่ admin
        return;
      }

      setUser(result.user);
      setLoading(false); // ผ่านแล้วค่อย render navbar
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg font-medium animate-pulse">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>

      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 text-2xl font-bold text-yellow-700">
              Hope Cafe ☕
            </div>

            {/* ชื่อผู้ใช้และ hamburger menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
               {user.name}
              </span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="bg-white shadow-md border-t">
            <div className="flex flex-col p-4 space-y-2">
              <a
                href="/Dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </a>

              <a
                href="/food"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded"
              >
                <span>🍔</span>
                <span>Foods</span>
              </a>

              <a
                href="/Employee"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded"
              >
                <span>👥</span>
                <span>Employee</span>
              </a>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

    </>
  );
}
