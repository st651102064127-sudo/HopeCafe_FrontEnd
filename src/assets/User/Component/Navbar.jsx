import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import checkUser from '../Checkuser';

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [user, setUser] = useState(null);
  const [desktopDropdown, setDesktopDropdown] = useState(false); // desktop dropdown
  const [loading, setLoading] = useState(true); // คุมการโหลดหน้า
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const result = await checkUser();
     
      
      if (!result.ok) {
        navigate('/'); // redirect ถ้าไม่ใช่ admin
        return;
      }

      setUser(result.user);
      console.log(User);
      
      setLoading(false); // ผ่านแล้วค่อย render navbar
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token
    navigate('/');
  };

  // Loader สวย ๆ ขณะตรวจสอบสิทธิ์
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg font-medium animate-pulse">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  return (
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
          👋 สวัสดี, <strong>{user.name}</strong>
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
          href="/Quere"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded"
        >
          <span>📊</span>
          <span>Orders</span>
        </a>
        
        <a
          href="/Payment"
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded"
        >
          <span>💸</span>
          <span>Payment</span>
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
  );
}
