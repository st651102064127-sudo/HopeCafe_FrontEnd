import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coffee, TrendingUp, Calendar, Users, ChefHat, Star,ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const token = localStorage.getItem("token"); // ดึง token จาก localStorage

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const baseURL = import.meta.env.VITE_API_URL;

    axios.get(`${baseURL}/api/dashboard/summary`, config)
      .then(res => setSummary(res.data || {}))
      .catch(err => console.error(err));

    axios.get(`${baseURL}/api/dashboard/sales/daily`, config)
      .then(res => setDaily(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(err => console.error(err));

    axios.get(`${baseURL}/api/dashboard/sales/weekly`, config)
      .then(res => setWeekly(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(err => console.error(err));

    axios.get(`${baseURL}/api/dashboard/sales/monthly`, config)
      .then(res => setMonthly(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(err => console.error(err));
  }, [token]);
  console.log();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-8 px-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => window.location = ('food')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">ย้อนกลับ</span>
          </button>
          <div className="flex items-center space-x-3">
            <Coffee className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Café Dashboard</h1>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
        <p className="text-center text-amber-100 text-lg">ระบบจัดการร้านกาแฟและเบเกอรี่</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Sales Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm opacity-80">Total</span>
            </div>
            <h2 className="font-bold text-xl mb-2">ยอดขายรวมทั้งหมด</h2>
            <p className="text-4xl font-bold">{Number(summary.totalSales || 0).toLocaleString()} ฿</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <span className="text-sm opacity-80">Today</span>
            </div>
            <h2 className="font-bold text-xl mb-2">ยอดขายวันนี้</h2>
            <p className="text-4xl font-bold">{Number(summary.dailySales || 0).toLocaleString()} ฿</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-8 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8" />
              <span className="text-sm opacity-80">Week</span>
            </div>
            <h2 className="font-bold text-xl mb-2">ยอดขายสัปดาห์นี้</h2>
            <p className="text-4xl font-bold">{Number(summary.weeklySales || 0).toLocaleString()} ฿</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <ChefHat className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h2 className="font-bold text-xl text-center text-gray-700 mb-2">หมวดหมู่ทั้งหมด</h2>
            <p className="text-4xl font-bold text-center text-purple-600">{summary.categoryCount || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-pink-100 rounded-full">
                <Coffee className="w-8 h-8 text-pink-600" />
              </div>
            </div>
            <h2 className="font-bold text-xl text-center text-gray-700 mb-2">รายการอาหารทั้งหมด</h2>
            <p className="text-4xl font-bold text-center text-pink-600">{summary.foodCount || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-cyan-100 rounded-full">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <h2 className="font-bold text-xl text-center text-gray-700 mb-2">Admin Users</h2>
            <p className="text-4xl font-bold text-center text-cyan-600">{summary.adminCount || 0}</p>
          </div>
        </div>

        {/* Top Menu Section */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-bold text-2xl text-gray-800">เมนูที่สั่งเยอะที่สุด 5 อันดับ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.isArray(summary.topMenu) && summary.topMenu.length > 0 ? (
              summary.topMenu.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-xl border-l-4 border-amber-500 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-amber-600">#{idx + 1}</span>
                    <span className="text-lg font-bold text-orange-600">{item.total_quantity} ครั้ง</span>
                  </div>
                  <p className="font-medium text-gray-700 text-lg">{item.food_name}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                <Coffee className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">ไม่มีข้อมูล</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
            <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              <span>ยอดขายรายวัน (7 วันล่าสุด)</span>
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#D97706"
                  strokeWidth={4}
                  dot={{ fill: '#D97706', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
            <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
              <span>ยอดขายรายสัปดาห์ (เดือนล่าสุด)</span>
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="total" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
            <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>ยอดขายรายเดือน (ปีนี้)</span>
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="total" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
