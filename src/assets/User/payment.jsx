import React, { useState, useEffect } from "react";
import { Coffee, Search, CreditCard, Receipt, CheckCircle } from "lucide-react";
import axios from "axios";
import PromptPayQR from "./PromptPayQR";
import Swal from "sweetalert2";
import checkUser from "./Checkuser";
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const [tableNumber, setTableNumber] = useState("");
    const [orders, setOrders] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true); // คุมการโหลดหน้า
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Mock     QR Code component

    useEffect(() => {
        const init = async () => {
            const result = await checkUser();

            if (!result.ok) {
                navigate('/');
                return;
            }

            setLoading(false); // เสร็จสิ้นโหลด user
        };
        init();
    }, [navigate]);

    const fetchOrders = async () => {
        if (!tableNumber) return;
        setLoadingOrders(true); // เริ่มโหลด orders
        try {
            const respons = await axios.post(`${URLAPI}/api/Payment/getOrders`, {
                table: tableNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const orderData = respons.data || [];

            if (orderData.length === 0) {
                Swal.fire({
                    icon: 'question',
                    title: 'ไม่พบข้อมูลโต๊ะนี้',
                    position: 'top-end',
                    showCancelButton: false,
                    showConfirmButton: false,
                    toast: true,
                });
            }

            const flatOrders = orderData.flatMap(order =>
                order.order_items.map(item => ({
                    product_name: item.product?.name || "ไม่ทราบชื่อ",
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity
                }))
            );

            setOrders(flatOrders);

            const total = flatOrders.reduce((sum, item) => sum + item.quantity * item.price, 0);
            setTotalPrice(total);

        } catch (err) {
            console.log(err);
        } finally {
            setLoadingOrders(false); // โหลด orders เสร็จ
        }
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
    // Mock data for demonstration
    const mockOrders = [
        { id: 1, product_name: "Americano", quantity: 2, price: 65 },
        { id: 2, product_name: "Cappuccino", quantity: 1, price: 85 },
        { id: 3, product_name: "Croissant", quantity: 1, price: 45 },
        { id: 4, product_name: "Cheesecake", quantity: 1, price: 120 }
    ];
    const URLAPI = `${import.meta.env.VITE_API_URL}`


    const handlePayment = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการชำระเงิน',
            html: 'กรุณารอสักครู่ <b>3</b> วินาที...',
            showCancelButton: true,
            confirmButtonText: 'ตกลง',
            didOpen: () => {
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.disabled = true; // ปุ่มกดไม่ได้ตอนแรก

                let timeLeft = 3;
                const b = Swal.getHtmlContainer().querySelector('b');

                const timer = setInterval(() => {
                    timeLeft -= 1;
                    b.textContent = timeLeft;
                }, 1000);

                setTimeout(() => {
                    confirmBtn.disabled = false; // ปลดล็อกปุ่ม
                    clearInterval(timer);
                }, 3000);
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post(`${URLAPI}/api/updatePayment`, {
                    table_number: tableNumber
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: response.data.message || 'อัปเดตการชำระเงินเรียบร้อย',
                });

                setOrders([]);
                setTotalPrice(0);
                setTableNumber("");

            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error.response?.data?.message || 'ไม่สามารถอัปเดตการชำระเงินได้',
                });
            }
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-amber-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* ชื่อร้าน */}
                    <div className="flex items-center space-x-3">
                        <Coffee className="w-8 h-8 text-amber-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Café Payment</h1>
                    </div>

                    {/* ปุ่มย้อนกลับ */}
                    <button
                        onClick={() => {
                            window.location.href = '/queue';
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl shadow transition"
                    >
                        ย้อนกลับ
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Table Input & Orders */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Table Search Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Search className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">ค้นหาโต๊ะ</h2>
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="กรอกหมายเลขโต๊ะ (เช่น 1, 2, 3)"
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="w-full border-2 border-amber-200 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={fetchOrders}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-8 py-4 rounded-2xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                    <span>ค้นหา</span>
                                </button>
                            </div>
                        </div>

                        {/* Orders List Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Receipt className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">รายการสั่ง</h2>
                                {tableNumber && (
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                                        โต๊ะ {tableNumber}
                                    </span>
                                )}
                            </div>

                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg">ยังไม่มีรายการสั่ง</p>
                                    <p className="text-gray-300 text-sm mt-1">กรอกหมายเลขโต๊ะและกดค้นหา</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="max-h-80 overflow-y-auto pr-2">
                                        {orders.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-amber-50 rounded-2xl mb-3 border border-amber-100"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 text-lg">{item.product_name}</h4>
                                                    <p className="text-amber-600 font-medium">
                                                        {item.quantity} รายการ × ฿{item.price}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-gray-800">
                                                        ฿{(item.quantity * item.price).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="border-t-2 border-amber-200 pt-4">
                                        <div className="flex items-center justify-between bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6">
                                            <span className="text-xl font-bold text-gray-800">รวมทั้งหมด</span>
                                            <span className="text-2xl font-bold text-amber-700">
                                                ฿{totalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - QR Code & Payment */}
                    <div className="space-y-6">

                        {/* QR Code Card */}
                        {orders.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">QR Code สำหรับชำระเงิน</h3>
                                    <p className="text-gray-500 text-sm mb-6">สแกนเพื่อชำระเงิน</p>

                                    <div className="bg-amber-50 p-6 rounded-2xl mb-6">
                                        <PromptPayQR accountNumber="0897046580" amount={120} />

                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 mb-1">รหัสการชำระ</p>
                                        <p className="font-mono text-sm text-gray-700">
                                            T{tableNumber}-{totalPrice}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Button Card */}
                        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">ยืนยันการรับเงิน</h3>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading || orders.length === 0}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>กำลังประมวลผล...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">รับเงิน</span>
                                        </>
                                    )}
                                </button>

                                {orders.length === 0 && (
                                    <p className="text-gray-400 text-sm mt-3">
                                        กรุณาค้นหาโต๊ะและตรวจสอบรายการก่อน
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Summary Card */}
                        {orders.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl shadow-lg border border-amber-200 p-6">
                                <h4 className="font-semibold text-gray-800 mb-4">สรุปรายการ</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">โต๊ะ:</span>
                                        <span className="font-medium">#{tableNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">จำนวนรายการ:</span>
                                        <span className="font-medium">{orders.length} รายการ</span>
                                    </div>
                                    <div className="flex justify-between border-t border-amber-200 pt-2">
                                        <span className="text-gray-800 font-semibold">ยอดรวม:</span>
                                        <span className="font-bold text-amber-700">฿{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;