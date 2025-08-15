import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import AdminNavbar from "./Component/Navbar";
import axios from "axios";
import ErrorMessage from "./Component/errorMessage";
import sweetAlert from "./Component/sweetAlert";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
const token = localStorage.getItem('token');

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: "",
        password: "",
        role: "staff",
        phone: "",
        status: true,
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [errorTrigger, setErrorTrigger] = useState(0);
    const [showForm, setShowForm] = useState(false);

    // โหลดข้อมูล
    const showData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/Employee/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setEmployees(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
            setErrorTrigger((prev) => prev + 1);
        }
    };

    useEffect(() => {
        showData();
    }, []);

    // เพิ่มพนักงาน
    const handleCreate = async (e) => {
        e.preventDefault();


        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/Employee/Store`,
                newEmployee,
                {
                    headers: {
                        "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`}
                    }
            );

            sweetAlert("show", response.data.message, response.data.status);
            await showData();

            setNewEmployee({
                name: "",
                password: "",
                role: "staff",
                phone: "",
                status: true,
            });
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
            setErrorTrigger((prev) => prev + 1);
        }
    };

    // แก้ไข
    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            console.log(editingEmployee);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/Employee/edit/${editingEmployee.id}`,
                editingEmployee,
                {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                }
            );
            sweetAlert("show", res.data.message, res.data.status);
            await showData();
            setModalOpen(false);
            setEditingEmployee(null);
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
            setErrorTrigger((prev) => prev + 1);
        }
    };

    const handleCancelEdit = () => {
        setModalOpen(false);
        setEditingEmployee(null);
    };

    // ลบ
    const Delete = async (id) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/Employee/delete/${id}`, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (response.data.status === "success") {
                await showData();
                sweetAlert("show", response.data.message, "success");
            } else {
                sweetAlert("show", response.data.message || "ลบไม่สำเร็จ", "error");
            }
        } catch (error) {
            sweetAlert("show", error.response?.data?.message || "เกิดข้อผิดพลาด", "error");
        }
    };

    const handleDelete = (id) => {
        sweetAlert("delete", "พนักงาน", "warning", () => {
            Delete(id);
        });
    };

    // สไตล์ตาราง
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#fef3c7",
                fontSize: "16px",
                fontWeight: "600",
            },
        },
        rows: {
            style: {
                fontSize: "15px",
                minHeight: "60px",
                "&:hover": {
                    backgroundColor: "#fff7ed",
                },
            },
        },
    };

    // คอลัมน์
    const columns = [
        {
            name: "#",
            selector: (_, index) => index + 1,
            width: "60px",
        },
        {
            name: "ชื่อ",
            selector: (row) => row.name,
            sortable: true,
        },

        {
            name: "ตำแหน่ง",
            selector: (row) => (row.role === "admin" ? "Admin" : "Staff"),
        },
        {
            name: "เบอร์โทร",
            selector: (row) => row.phone || "-",
        },
        {
            name: "สถานะ",
            cell: (row) => (
                <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${row.status ? "bg-green-500" : "bg-gray-400"
                        }`}
                >
                    {row.status ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            name: "จัดการ",
            cell: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        แก้ไข
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        ลบ
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            <AdminNavbar />
            <div className="max-w-7xl mx-auto py-10 px-4">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
                    จัดการพนักงาน
                </h2>

                {/* ปุ่ม toggle */}
                <div className="bg-white rounded-3xl shadow-lg mb-8 overflow-hidden">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center justify-between w-full px-6 py-4 bg-amber-400 text-white font-semibold text-lg hover:bg-amber-500 transition"
                    >
                        <span>เพิ่มพนักงานใหม่</span>
                        {showForm ? (
                            <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                        )}
                    </button>

                    {/* ฟอร์มเพิ่มพนักงาน */}
                    {showForm && (
                        <div className="p-6">
                            {error && <ErrorMessage message={error} trigger={errorTrigger} />}
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="ชื่อ"
                                        value={newEmployee.name}
                                        onChange={(e) =>
                                            setNewEmployee({ ...newEmployee, name: e.target.value })
                                        }
                                        className="border-2 border-amber-200 rounded-2xl px-4 py-2"
                                        required
                                    />

                                    <input
                                        type="password"
                                        placeholder="รหัสผ่าน"
                                        value={newEmployee.password}
                                        onChange={(e) =>
                                            setNewEmployee({
                                                ...newEmployee,
                                                password: e.target.value,
                                            })
                                        }
                                        className="border-2 border-amber-200 rounded-2xl px-4 py-2"
                                        required
                                    />
                                    <select
                                        value={newEmployee.role}
                                        onChange={(e) =>
                                            setNewEmployee({ ...newEmployee, role: e.target.value })
                                        }
                                        className="border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="เบอร์โทร"
                                        value={newEmployee.phone}
                                        onChange={(e) =>
                                            setNewEmployee({ ...newEmployee, phone: e.target.value })
                                        }
                                        className="border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    />
                                    <select
                                        value={newEmployee.status}
                                        onChange={(e) =>
                                            setNewEmployee({
                                                ...newEmployee,
                                                status: e.target.value === "true",
                                            })
                                        }
                                        className="border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-2xl transition"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* ตารางพนักงาน */}
                <div className="bg-white rounded-3xl shadow-lg">
                    <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-3xl">
                        <h3 className="text-lg font-semibold text-gray-800">
                            รายชื่อพนักงาน
                        </h3>
                    </div>
                    <div className="p-6">
                        <DataTable
                            columns={columns}
                            data={employees}
                            pagination
                            highlightOnHover
                            dense
                            responsive
                            customStyles={customStyles}
                        />
                    </div>
                </div>
            </div>
            {/* Modal แก้ไข */}
            {modalOpen && editingEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">แก้ไขพนักงาน</h3>
                        <div className="space-y-4">
                            {/* ชื่อ */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">ชื่อ</label>
                                <input
                                    type="text"
                                    value={editingEmployee.name}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    placeholder="ชื่อ"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">รหัสผ่าน</label>
                                <input
                                    type="password"
                                    placeholder="รหัสผ่าน"
                                    value={editingEmployee.password}
                                    onChange={(e) =>
                                        setEditingEmployee({
                                            ...editingEmployee,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    required
                                />
                            </div>
                            {/* ตำแหน่ง */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">ตำแหน่ง</label>
                                <select
                                    value={editingEmployee.role}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* เบอร์โทร */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">เบอร์โทร</label>
                                <input
                                    type="text"
                                    value={editingEmployee.phone || ""}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2"
                                    placeholder="เบอร์โทร"
                                />
                            </div>

                            {/* สถานะ */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">สถานะ</label>
                                <select
                                    value={editingEmployee.status}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value === "true" })}
                                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* ปุ่มจัดการ */}
                        <div className="flex justify-end mt-6 gap-3">
                            <button onClick={handleCancelEdit} className="px-4 py-2 rounded-2xl bg-gray-200 hover:bg-gray-300 transition">
                                ยกเลิก
                            </button>
                            <button onClick={handleUpdate} className="px-4 py-2 rounded-2xl bg-amber-400 text-white hover:bg-amber-500 transition">
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

};

export default Employee;
