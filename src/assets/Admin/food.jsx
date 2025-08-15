import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import AdminNavbar from './Component/Navbar';
import axios from 'axios';
import sweetAlert from './Component/sweetAlert';
import './style/food.css';
import './style/categories.css';

const ItemManagement = ({ allowOverflow }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const urlImage = `${import.meta.env.VITE_API_URL}`;
  const token = localStorage.getItem('token');
  // Fetch data
  const getData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/food`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/categories`)
      ]);
      setItems(foodRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { getData(); }, []);

  // Create item
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategory) return;

    try {
      const formData = new FormData();
      formData.append('name', newItemName);
      formData.append('description', newItemDescription);
      formData.append('price', newItemPrice);
      formData.append('category_id', newItemCategory);
      if (newItemImage) formData.append('image', newItemImage);


      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food/store`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // 🔑 ต้องอยู่ใน headers
          },
        }
      );

      setItems(prev => [...prev, response.data.data]);
      sweetAlert('show', "เพิ่มเมนูใหม่เรียบร้อยแล้ว", "success");

      // Reset form
      setNewItemName(''); setNewItemDescription(''); setNewItemPrice('');
      setNewItemCategory(''); setNewItemImage(null); setPreviewImage(null);
      setShowForm(false);

    } catch (error) {
      sweetAlert("show", error.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มเมนู", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItemImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Delete item
  const destroy = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/food/delete/${id}`,{
        headers : {
             Authorization: `Bearer ${token}`, 
        }
      });
      if (response.data.status === 'success') {
        setItems(prev => prev.filter(item => item.id !== id));
        sweetAlert('show', response.data.message, 'success');
      }
    } catch (error) {
      sweetAlert('show', 'เกิดข้อผิดพลาดในการลบเมนู', 'error');
    }
  };

  const handleDeleteItem = (id) => {
    const item = items.find(i => i.id === id);
    const message = `คุณต้องการลบรายการ: \n${item.name}\n`;
    sweetAlert('delete', message, "warning", () => { destroy(id) }, item.image);
  };

  // Edit
  const handleEdit = (item) => { setEditingItem({ ...item }); setModalOpen(true); };
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editingItem.name);
      formData.append('description', editingItem.description);
      formData.append('price', editingItem.price);
      formData.append('category_id', editingItem.category_id);
      formData.append('_method', 'PUT');
      if (editingItem.newImageFile) formData.append('image', editingItem.newImageFile);

      await axios.post(`${import.meta.env.VITE_API_URL}/api/food/update/${editingItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}`, }
      });

      await getData();
      sweetAlert("show", "อัพเดทรายการอาหารเรียบร้อยแล้ว", "success");
      setModalOpen(false); setEditingItem(null);
    } catch (error) {
      sweetAlert("show", error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดท", "error");
    }
  };

  const handleCancelEdit = () => { setModalOpen(false); setEditingItem(null); };

  // DataTable Columns
  const columns = [
    { name: '#', selector: (row, i) => i + 1, width: '50px' },
    { name: 'ชื่อเมนู', selector: row => row.name, wrap: true },
    { name: 'คำอธิบาย', selector: row => row.description, wrap: true },
    { name: 'ราคา', selector: row => `${row.price} บาท`, width: '100px' },
    {
      name: 'หมวดหมู่', selector: row => categories.find(cat => cat.id === row.category_id)?.name || 'ไม่ระบุ',
      cell: row => (
        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
          {categories.find(cat => cat.id === row.category_id)?.name || 'ไม่ระบุ'}
        </span>
      ),
      width: '150px'
    },
    {
      name: 'รูปภาพ',
      cell: row => (
        row.image ?
          <img src={urlImage + row.image} alt={row.name} className="w-16 h-16 object-cover rounded-lg shadow-md" /> :
          <div className="w-16 h-16 bg-amber-100 flex items-center justify-center rounded-lg"><i className="fas fa-image text-amber-400" /></div>
      ),
      width: '80px'
    },
    {
      name: 'จัดการ',
      cell: row => (
        <div className="flex space-x-2 justify-center">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 text-sm font-medium" onClick={() => handleEdit(row)}>แก้ไข</button>
          <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 text-sm font-medium" onClick={() => handleDeleteItem(row.id)}>ลบ</button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '200px'
    }
  ];

  const customStyles = {
    headCells: { style: { fontSize: '14px', fontWeight: 600, paddingLeft: '16px', paddingRight: '16px' } },
    cells: { style: { fontSize: '13px', paddingLeft: '16px', paddingRight: '16px' } },
    rows: { style: { minHeight: '60px' } },
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-25" style={{ overflow: allowOverflow ? "visible" : "hidden" }}>
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-amber-900 mb-2">จัดการรายการอาหาร</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto rounded-full"></div>
          </div>

          {/* Toggle Add Form */}
          <div className="mb-6 text-center">
            <button
              className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg shadow-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 font-medium"
              onClick={() => setShowForm(!showForm)}
            >
              <i className={`fas fa-${showForm ? 'minus' : 'plus'} mr-3 text-lg`}></i>
              {showForm ? 'ซ่อนฟอร์มเพิ่มเมนู' : 'เพิ่มเมนูอาหารใหม่'}
            </button>
          </div>

          {/* Add Menu Form */}
          {showForm && (
            <form className="mb-8 animate-fadeIn bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden p-6" onSubmit={handleCreateItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">ชื่อเมนู</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">ราคา (บาท)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-amber-900 mb-2">คำอธิบาย</label>
                <textarea
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50 resize-none"
                  rows="4"
                  value={newItemDescription}
                  onChange={e => setNewItemDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">หมวดหมู่</label>
                  <select
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    required
                  >
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">เลือกรูปเมนู</label>
                  <input
                    type="file"
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {previewImage && (
                <div className="text-center mb-6">
                  <img src={previewImage} alt="Preview" className="inline-block max-w-48 h-32 object-cover rounded-lg shadow-md border border-amber-200" />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg shadow-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  เพิ่มเมนู
                </button>
              </div>
            </form>
          )}

          {/* Menu Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
              <h3 className="text-xl font-semibold text-amber-900">รายการเมนูทั้งหมด</h3>
            </div>
            <div className="p-4">
              <DataTable
                columns={columns}
                data={items}
                pagination
                highlightOnHover
                dense
                customStyles={customStyles}
                responsive
              />
            </div>
          </div>

          {/* Edit Modal */}
          {modalOpen && editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                  <h3 className="text-xl font-semibold text-amber-900">แก้ไขรายการอาหาร</h3>
                </div>
                <div className="p-6 space-y-6">

                  {/* Name & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">ชื่อเมนู</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                        value={editingItem.name}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">ราคา</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                        value={editingItem.price}
                        onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">คำอธิบาย</label>
                    <textarea
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50 resize-none"
                      rows="4"
                      value={editingItem.description}
                      onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                    />
                  </div>

                  {/* Category & Image */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">หมวดหมู่</label>
                      <select
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50"
                        value={editingItem.category_id || ""}
                        onChange={e => setEditingItem({ ...editingItem, category_id: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-2">เลือกรูปใหม่ (ถ้าต้องการเปลี่ยน)</label>
                      <input
                        type="file"
                        className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-amber-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setEditingItem(prev => ({ ...prev, newImageFile: file, previewImageUrl: previewUrl }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {(editingItem.previewImageUrl || editingItem.image) && (
                    <div className="text-center">
                      <div className="inline-block p-2 bg-amber-50 rounded-xl border border-amber-200">
                        <img
                          src={editingItem.previewImageUrl || urlImage + editingItem.image}
                          alt="Preview"
                          className="max-w-48 h-32 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 font-medium"
                      onClick={handleCancelEdit}
                    >
                      <i className="fas fa-times mr-2"></i> ยกเลิก
                    </button>
                    <button
                      type="button"
                      className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg shadow-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 font-medium"
                      onClick={handleUpdate}
                    >
                      <i className="fas fa-save mr-2"></i> บันทึก
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );


};

export default ItemManagement;
