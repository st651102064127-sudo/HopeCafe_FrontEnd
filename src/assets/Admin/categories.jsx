import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import AdminNavbar from './Component/Navbar';
import axios from 'axios';
import ErrorMessage from './Component/errorMessage';
import sweetAlert from './Component/sweetAlert';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const token = localStorage.getItem('token');

  // โหลดข้อมูลหมวดหมู่
  const showData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setErrorTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    showData();
  }, []);

  // เพิ่มหมวดหมู่
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory = {
      name: newCategoryName,
      description: newCategoryDescription,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/categories/store`, newCategory, {
        headers: { 'Content-Type': 'application/json' , Authorization: `Bearer ${token}`},
      });

      const createdCategory = response.data.category || null;
      if (createdCategory) {
        setCategories(prev => [...prev, createdCategory]);
      } else {
        await showData();
      }

      sweetAlert('show', response.data.message, response.data.status);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
      setErrorTrigger(prev => prev + 1);
    }
  };

  // เตรียมแก้ไข
  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  // บันทึกการแก้ไข
  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/categories/${editingCategory.id}`, editingCategory, {
        headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}` },
      });
      sweetAlert('show', res.data.message, res.data.status);
      await showData();
      setModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่");
      setErrorTrigger(prev => prev + 1);
    }
  };

  const handleCancelEdit = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  // ลบหมวดหมู่
  const Delete = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/categories/delete/${id}`,
        {
          headers : { Authorization: `Bearer ${token}`}
        }
      );
      if (response.data.status === 'success') {
        await showData();
        sweetAlert('show', response.data.message, 'success');
      } else {
        sweetAlert('show', response.data.message || 'ลบไม่สำเร็จ', 'error');
      }
    } catch (error) {
      sweetAlert('show', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDelete = (id) => {
    sweetAlert('delete', 'ประเภทอาหาร', 'warning', () => { Delete(id); });
  };
  const customStyles = {
    header: {
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#1f2937", // gray-800
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#fef3c7", // amber-50
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        color: "#374151", // gray-700
      },
    },
    rows: {
      style: {
        fontSize: "16px",
        color: "#1f2937", // gray-800
        minHeight: "60px", // เพิ่มความสูงแถว
        "&:hover": {
          backgroundColor: "#fff7ed", // hover สีอ่อน
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb", // gray-200
        fontSize: "16px",
        padding: "8px 16px",
      },
    },
  };
  // กำหนด columns ของ DataTable
  const columns = [

    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "ชื่อหมวดหมู่",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "คำอธิบาย",
      selector: (row) => row.description || "-",
      wrap: true,
    },
    {
      name: "จัดการ",
      cell: (row) => (
        <div className="flex  items-center">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-shadow duration-200"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-shadow duration-200"
          >
            ลบ
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 py-25">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          จัดการหมวดหมู่รายการอาหาร
        </h2>

        {/* Create Category Card */}
        <div className="bg-white rounded-3xl shadow-lg mb-8">
          <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-3xl">
            <h3 className="text-lg font-semibold text-gray-800">เพิ่มหมวดหมู่ใหม่</h3>
          </div>
          <div className="p-6">
            {error && <ErrorMessage message={error} trigger={errorTrigger} />}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="categoryName" className="block text-gray-700 font-medium mb-1">
                    ชื่อหมวดหมู่
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="categoryDescription" className="block text-gray-700 font-medium mb-1">
                    คำอธิบาย
                  </label>
                  <input
                    type="text"
                    id="categoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                  />
                </div>

                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-2xl transition"
                  >
                    เพิ่มหมวดหมู่
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white rounded-3xl shadow-lg">
          <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-3xl">
            <h3 className="text-lg font-semibold text-gray-800">รายการหมวดหมู่ทั้งหมด</h3>
          </div>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={categories}
              pagination
              highlightOnHover
              dense
              responsive
              customStyles={customStyles}

            />
          </div>
        </div>

        {/* Edit Modal */}
        {modalOpen && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">แก้ไขหมวดหมู่</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">ชื่อหมวดหมู่</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">คำอธิบาย</label>
                  <input
                    type="text"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full border-2 border-amber-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded-2xl bg-amber-400 text-white hover:bg-amber-500 transition"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
