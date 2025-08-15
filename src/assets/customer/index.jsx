import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import axios from 'axios';

const index = () => {
    const [currentPage, setCurrentPage] = useState('menu');
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [categories, setCategories] = useState([]);
    const [tableNumber, setTableNumber] = useState(null);
    const [products, setProducts] = useState([]);

    const URL = `${import.meta.env.VITE_API_URL}/api`;
    const URLIMAGE = `${import.meta.env.VITE_API_URL}`;

    const CART_KEY = 'cart_data';
    const CART_EXPIRE = 10 * 60 * 1000; // 10 นาที

    // โหลดตะกร้าจาก localStorage ตอนเริ่ม
    useEffect(() => {
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < CART_EXPIRE) {
                setCart(parsed.items);
            } else {
                localStorage.removeItem(CART_KEY);
            }
        }
    }, []);

    // บันทึกตะกร้าลง localStorage ทุกครั้งที่เปลี่ยน
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem(
                CART_KEY,
                JSON.stringify({ items: cart, timestamp: Date.now() })
            );
        } else {
            localStorage.removeItem(CART_KEY);
        }
    }, [cart]);

    async function getData() {
        try {
            const cat = await axios.get(`${URL}/categories`);
            const foods = await axios.get(`${URL}/food`);
            setCategories(cat.data.data);
            setProducts(foods.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.keys().next().value; // อ่านชื่อพารามิเตอร์เดียว
        if (encoded) {
            try {
                const decoded = atob(encoded);
                const match = decoded.match(/(\d+)$/);
                if (match) setTableNumber(match[1]);
            } catch (err) {
                console.error('ถอดรหัสไม่สำเร็จ', err);
            }
        }
    }, []);

    useEffect(() => {
        getData();
    }, []);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, change) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const getTotalPrice = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);


    const placeOrder = async () => {
        if (!tableNumber) {
            alert("❌ ไม่พบหมายเลขโต๊ะ");
            return;
        }
        if (cart.length === 0) {
            alert("❌ ตะกร้าว่าง");
            return;
        }

        try {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const stored = localStorage.getItem("queue_number_" + today);
            let queueNumber = stored ? parseInt(stored) + 1 : 1;

            // เก็บ queue number วันนี้ไว้ใน localStorage
            localStorage.setItem("queue_number_" + today, queueNumber);

            const queueCode = `Q${today.replace(/-/g, '')}-${String(queueNumber).padStart(3, '0')}`;

            const payload = {
                table_number: tableNumber,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                })),
                total_price: getTotalPrice(),

                // ข้อมูลคิว
                queue_code: queueCode,
                queue_number: queueNumber,

                // สถานะเริ่มต้น
                status_queue: "รับออเดอร์",
                status_payment: "ยังไม่จ่าย"
            };
            console.log(payload);

            const res = await axios.post(`${URL}/Orders/store`, payload);

            if (res.status === 200 || res.status === 201) {
                alert(`✅ สั่งอาหารสำเร็จ! คิวของคุณคือ ${queueCode}`);
                setCart([]);
                setCurrentPage('menu');
            }
        } catch (error) {
            console.error("Error placing order:", error);
            alert("❌ สั่งอาหารไม่สำเร็จ กรุณาลองใหม่");
        }
    };
    if (currentPage === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">☕ Hope Cafe โต๊ะที่ : {tableNumber}</h1>
                            <p className="text-amber-100 text-sm">เลือกเครื่องดื่มและขนมโปรด</p>
                        </div>
                        <button
                            onClick={() => setCurrentPage('cart')}
                            className="relative  bg-opacity-70 p-3 rounded-full hover:bg-opacity-90 transition-all"
                        >
                            <ShoppingCart size={24} />
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>

                    </div>
                </div>

                {/* Category Tabs */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex overflow-x-auto p-2 space-x-2">
                        <button
                            key="ทั้งหมด"
                            onClick={() => setSelectedCategory('ทั้งหมด')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === 'ทั้งหมด' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            <span className="font-medium">ทั้งหมด</span>
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                            >
                                <span className="font-medium">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {selectedCategory === 'ทั้งหมด' ? 'ทั้งหมด' : categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products
                            .filter(p => selectedCategory === 'ทั้งหมด' || p.category_id === selectedCategory)
                            .map(product => (
                                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                                    <div className="p-4">
                                        <div className="flex items-start space-x-4">
                                            <img src={URLIMAGE + product.image} alt={product.name} className="w-24 h-24 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-bold text-amber-600">฿{product.price}</span>
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                                                    >
                                                        <Plus size={16} />
                                                        <span>เพิ่ม</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    // Cart Page
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setCurrentPage('menu')}
                        className=" bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">🛒 ตะกร้าสินค้า</h1>
                        <p className="text-amber-100 text-sm">ตรวจสอบรายการก่อนสั่ง</p>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {cart.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-xl font-bold text-gray-600 mb-2">ตะกร้าว่างเปล่า</h2>
                        <p className="text-gray-500 mb-6">กลับไปเลือกเครื่องดื่มและขนมที่คุณชอบ</p>
                        <button
                            onClick={() => setCurrentPage('menu')}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                        >
                            เลือกสินค้า
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-4 mb-6">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <img src={URLIMAGE + item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                            <p className="text-amber-600 font-bold">฿{item.price}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-all"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-bold text-lg min-w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition-all"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right mt-2">
                                        <span className="text-lg font-bold text-gray-800">
                                            รวม: ฿{item.price * item.quantity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">จำนวนรายการ:</span>
                                    <span className="font-bold">{getTotalItems()} ชิ้น</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-800">ยอดรวมทั้งหมด:</span>
                                        <span className="text-2xl font-bold text-amber-600">฿{getTotalPrice()}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r
                             from-green-500 to-green-600 text-white py-4 rounded-2xl hover:from-green-600 hover:to-green-700 
                             transition-all shadow-lg hover:shadow-xl mt-6 text-lg font-bold" onClick={placeOrder}>
                                🍴 สั่งอาหารเลย
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default index;
