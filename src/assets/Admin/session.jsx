import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import AdminNavbar from "./Component/Navbar";

const EmployeeSession = () => {
  const [sessions, setSessions] = useState([]);
  
  // ดึงข้อมูล session จาก Laravel
  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-sessions`, {
        withCredentials: true, // ส่ง cookie session
      });
      if (res.data.status === "success") {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "60px",
    },
    {
      name: "ชื่อผู้ใช้",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "ตำแหน่ง",
      selector: (row) => row.role,
      sortable: true,
    },
    {
      name: "เบอร์โทร",
      selector: (row) => row.phone || "-",
    },
    {
      name: "สถานะ",
      selector: (row) => (row.is_online ? "Online" : "Offline"),
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-2xl text-white text-sm ${
            row.is_online ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          {row.is_online ? "Online" : "Offline"}
        </span>
      ),
    },
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: "60px",
        fontSize: "16px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#fef3c7",
        fontWeight: "600",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          รายการ Session ผู้ใช้งาน
        </h2>
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <DataTable
            columns={columns}
            data={sessions}
            pagination
            highlightOnHover
            dense
            responsive
            customStyles={customStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeSession;
