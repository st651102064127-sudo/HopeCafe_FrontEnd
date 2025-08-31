import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Clock, CheckCircle, XCircle, Users, Filter, Search } from 'lucide-react';
import { queue } from 'jquery';
import axios from 'axios';
import Swal from 'sweetalert2';
import UserNavbar from './Component/Navbar';
const Queue = () => {
    // Mock data สำหรับ orders และ order items
    const [orders, setOrders] = useState([]);

    const [selectedOrders, setSelectedOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
    const token = localStorage.getItem('token');



    // ฟังก์ชันสำหรับอัพเดทสถานะแบบกลุ่ม
    const updateBulkStatus = (newStatus) => {
        setOrders(orders.map(order =>
            selectedOrders.includes(order.id)
                ? { ...order, status_queue: newStatus }
                : order
        ));
        setSelectedOrders([]);
    };

    // ฟังก์ชันสำหรับเลือกออเดอร์
    const toggleOrderSelection = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    // ฟังก์ชันสำหรับเลือกทั้งหมด
    const selectAllOrders = () => {
        const visibleOrderIds = filteredOrders.map(order => order.id);
        setSelectedOrders(
            selectedOrders.length === visibleOrderIds.length ? [] : visibleOrderIds
        );
    };

    // กรองข้อมูล
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status_queue === filterStatus;
        const matchesSearch =
            order.queue_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesStatus && matchesSearch;
    });

    // สีและไอคอนสำหรับสถานะ
    const getStatusStyle = (status) => {
        const styles = {
            pending: {
                bg: 'bg-amber-100',
                text: 'text-amber-800',
                border: 'border-amber-200',
                icon: Clock
            },
            preparing: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-200',
                icon: Coffee
            },
            ready: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-200',
                icon: CheckCircle
            },
            completed: {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-200',
                icon: CheckCircle
            }
        };
        return styles[status] || styles.pending;
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'รอดำเนินการ',
            preparing: 'กำลังเตรียม',
            ready: 'พร้อมเสิร์ฟ',
            completed: 'เสร็จสิ้น'
        };
        return texts[status] || status;
    };


    const API_URL = `${import.meta.env.VITE_API_URL}/api`



    const intervalRef = useRef(null);
    const modalIsOpenRef = useRef(false);

    // อัพเดท ref เมื่อ modal เปิด/ปิด
    useEffect(() => {
        modalIsOpenRef.current = showStatusModal;
    }, [showStatusModal]);

    useEffect(() => {
        // ฟังก์ชันดึงข้อมูล
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/Orders/getData`,{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(res.data.data);
                console.log('Data refreshed at:', new Date().toLocaleTimeString());
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        // เรียกครั้งแรกทันที
        fetchData();

        // ตั้งเวลาให้เรียกทุก 1 นาที (60000 มิลลิวินาที)
        intervalRef.current = setInterval(() => {
            if (!modalIsOpenRef.current) { // ตรวจสอบว่าไม่มี Modal เปิดอยู่
                fetchData();
            } else {
                console.log('Skipped refresh due to open modal');
            }
        }, 60000);

        // ทำความสะอาด Interval เมื่อ Component Unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // แสดง SweetAlert สำหรับยืนยันการเปลี่ยนสถานะ
            const result = await Swal.fire({
                title: 'ยืนยันการเปลี่ยนสถานะ',
                text: `คุณต้องการเปลี่ยนสถานะออเดอร์เป็น "${getStatusText(newStatus)}" ใช่หรือไม่?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ใช่, เปลี่ยนสถานะ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
            });

            // ถ้าผู้ใช้กยเลิก
            if (!result.isConfirmed) {
                return;
            }

            // ส่ง request อัพเดทสถานะ
            const response = await axios.put(`${API_URL}/Orders/${orderId}/status`, {
                status_queue: newStatus
            },{
                headers : {
                    Authorization: `Bearer ${token}`
                }
            });

            // อัพเดท state จาก response
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status_queue: response.data.status_queue }
                    : order
            ));

            // แสดง SweetAlert เมื่อสำเร็จ
            await Swal.fire({
                title: 'สำเร็จ!',
                text: `เปลี่ยนสถานะออเดอร์เป็น "${getStatusText(response.data.status_queue)}" แล้ว`,
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#3085d6',
            });

            console.log(`Order ${orderId} updated to ${newStatus}`);
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating order status:', error);

            await Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถเปลี่ยนสถานะออเดอร์ได้',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#3085d6',
            });
        }
    };



    // ฟังก์ชันเปิด modal สำหรับเปลี่ยนสถานะ
    const openStatusModal = (order) => {
        setSelectedOrderForStatus(order);
        setShowStatusModal(true);
    };
  
    
    return (
        <>

            <UserNavbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 pt-20 ">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <Coffee className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">จัดการออเดอร์</h1>
                                    <p className="text-gray-600">ระบบจัดการออเดอร์คาเฟ่</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">ออเดอร์ทั้งหมด</div>
                                    <div className="text-2xl font-bold text-amber-600">{orders.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            {/* Search */}
                            <div className="flex-1 min-w-64">
                                <div className="relative">
                                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาด้วยรหัสคิว, โต๊ะ, หรือเมนู..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-500" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกสถานะ</option>
                                    <option value="รับออเดอร์">รับออเดอร์</option>
                                    <option value="พร้อมเสิร์ฟ">พร้อมเสิร์ฟ</option>
                                    <option value="เสิร์ฟแล้ว">เสิร์ฟแล้ว</option>

                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedOrders.length > 0 && (
                            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-amber-600" />
                                    <span className="text-amber-800 font-medium">
                                        เลือก {selectedOrders.length} ออเดอร์
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateBulkStatus('preparing')}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-base"
                                    >
                                        🔥 เปลี่ยนเป็น "กำลังเตรียม"
                                    </button>
                                    <button
                                        onClick={() => updateBulkStatus('ready')}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-base"
                                    >
                                        ✅ เปลี่ยนเป็น "พร้อมเสิร์ฟ"
                                    </button>
                                    <button
                                        onClick={() => updateBulkStatus('completed')}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-base"
                                    >
                                        🎉 เปลี่ยนเป็น "เสร็จสิ้น"
                                    </button>
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredOrders.map(order => {
                            const statusStyle = getStatusStyle(order.status_queue);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${selectedOrders.includes(order.id)
                                        ? 'border-amber-400 ring-4 ring-amber-100'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-gray-800">
                                                            {order.queue_code}
                                                        </span>
                                                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                            โต๊ะ {order.table_number}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        คิวที่ {order.queue_number} • {order.created_at}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`px-3 py-1 rounded-full border flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {getStatusText(order.status_queue)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-2">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-gray-700">{item.product_name}</span>
                                                    </div>
                                                    <span className="text-gray-600">₿{item.price}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                            <span className="font-medium text-gray-700">รวมทั้งสิ้น</span>
                                            <span className="text-lg font-bold text-amber-600">₿{order.total_price}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 bg-gray-50 rounded-b-2xl">
                                        <div className="flex gap-3">
                                            {order.status_queue !== 'completed' && (
                                                <button
                                                    onClick={() => openStatusModal(order)}
                                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
                                                >
                                                    📝 รายละเอียดออเดอร์
                                                </button>
                                            )}

                                            {order.status_queue === 'completed' && (
                                                <div className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-xl text-center text-lg font-semibold border-2 border-dashed border-gray-300">
                                                    ✨ ออเดอร์สำเร็จ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบออเดอร์</h3>
                            <p className="text-gray-500">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
                        </div>
                    )}

                    {/* Status Change Modal */}
                    {showStatusModal && selectedOrderForStatus && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="p-8 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                                                <Coffee className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-800">เปลี่ยนสถานะออเดอร์</h2>
                                                <p className="text-lg text-gray-600 mt-1">
                                                    {selectedOrderForStatus.queue_code} • โต๊ะ {selectedOrderForStatus.table_number}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowStatusModal(false)}
                                            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                                        >
                                            <XCircle className="w-6 h-6 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-8">
                                    {/* Order Details */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดออเดอร์</h3>
                                        <div className="space-y-3">
                                            {selectedOrderForStatus.items.map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-10 h-10 bg-amber-200 text-amber-800 rounded-xl flex items-center justify-center font-bold">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-lg font-medium text-gray-800">{item.product_name}</span>
                                                    </div>
                                                    <span className="text-lg font-semibold text-gray-700">₿{item.price}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-amber-300 pt-3 mt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-gray-800">รวมทั้งสิ้น</span>
                                                    <span className="text-2xl font-bold text-amber-600">₿{selectedOrderForStatus.total_price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Status */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">สถานะปัจจุบัน</h3>
                                        <div className="flex justify-center">
                                            {(() => {
                                                const statusStyle = getStatusStyle(selectedOrderForStatus.status_queue);
                                                const StatusIcon = statusStyle.icon;
                                                return (
                                                    <div className={`px-8 py-4 rounded-2xl border-2 flex items-center gap-3 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                        <StatusIcon className="w-8 h-8" />
                                                        <span className="text-2xl font-bold">
                                                            {getStatusText(selectedOrderForStatus.status_queue)}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Status Change Options */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-6">เลือกสถานะใหม่</h3>
                                        <div className="grid grid-cols-1 gap-4">

                                            {selectedOrderForStatus.status_queue === 'รับออเดอร์' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrderForStatus.id, 'เสิร์ฟแล้ว')}
                                                    className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 active:scale-98 transition-all duration-200 shadow-xl hover:shadow-2xl"
                                                >
                                                    <div className="flex items-center justify-center gap-4">
                                                        <CheckCircle className="w-10 h-10" />
                                                        <div className="text-left">
                                                            <div className="text-2xl font-bold">✅ พร้อมเสิร์ฟ</div>
                                                            <div className="text-green-100 mt-1">อาหารพร้อมส่งให้ลูกค้า</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )}

                                            {selectedOrderForStatus.status_queue === 'เสิร์ฟแล้ว' && (
                                                <button

                                                    className="p-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 active:scale-98 transition-all duration-200 shadow-xl hover:shadow-2xl"
                                                >
                                                    <div className="flex items-center justify-center gap-4">
                                                        <CheckCircle className="w-10 h-10" />
                                                        <div className="text-left">
                                                            <div className="text-2xl font-bold">🎉 เสร็จสิ้น</div>
                                                            <div className="text-gray-100 mt-1">ออเดอร์สำเร็จเรียบร้อย</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )}

                                            {/* Skip Status Options */}
                                            {selectedOrderForStatus.status_queue === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateOrderStatus(selectedOrderForStatus.id, 'ready')}
                                                        className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 active:scale-98 transition-all duration-200 shadow-xl hover:shadow-2xl"
                                                    >
                                                        <div className="flex items-center justify-center gap-4">
                                                            <CheckCircle className="w-10 h-10" />
                                                            <div className="text-left">
                                                                <div className="text-2xl font-bold">⚡ พร้อมเสิร์ฟทันที</div>
                                                                <div className="text-green-100 mt-1">ข้ามขั้นตอนการเตรียม</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(selectedOrderForStatus.id, 'completed')}
                                                        className="p-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 active:scale-98 transition-all duration-200 shadow-xl hover:shadow-2xl"
                                                    >
                                                        <div className="flex items-center justify-center gap-4">
                                                            <CheckCircle className="w-10 h-10" />
                                                            <div className="text-left">
                                                                <div className="text-2xl font-bold">🚀 เสร็จสิ้นทันที</div>
                                                                <div className="text-gray-100 mt-1">ข้ามทุกขั้นตอน</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </>
                                            )}

                                            {selectedOrderForStatus.status_queue === 'preparing' && (
                                                <button
                                                    onClick={() => updateOrderStatus(selectedOrderForStatus.id, 'completed')}
                                                    className="p-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 active:scale-98 transition-all duration-200 shadow-xl hover:shadow-2xl"
                                                >
                                                    <div className="flex items-center justify-center gap-4">
                                                        <CheckCircle className="w-10 h-10" />
                                                        <div className="text-left">
                                                            <div className="text-2xl font-bold">🚀 เสร็จสิ้นเลย</div>
                                                            <div className="text-gray-100 mt-1">ข้ามขั้นตอนพร้อมเสิร์ฟ</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                                    <button
                                        onClick={() => setShowStatusModal(false)}
                                        className="w-full px-6 py-4 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 active:scale-98 transition-all duration-200 text-lg font-semibold"
                                    >
                                        ❌ ยกเลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Queue;