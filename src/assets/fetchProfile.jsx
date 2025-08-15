import axios from 'axios';

const fetchProfile = async () => {
  const token = localStorage.getItem('token'); // token หลัง login

  try {
    const response = await axios.get(  `${import.meta.env.VITE_API_URL}/api/get-profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // 🔑 ต้องส่ง token
        'Content-Type': 'application/json',
      },
      withCredentials: true // ใช้ถ้า backend ใช้ cookie-based
    });

    return response.data.user;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};

export default fetchProfile;
