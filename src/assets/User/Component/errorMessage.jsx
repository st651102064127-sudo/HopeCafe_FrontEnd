import React, { useState, useEffect } from 'react';
export default function ErrorMessage({ message, trigger }) {
    const [show, setShow] = useState(true);
    console.log(trigger);
    
    useEffect(() => {
        setShow(true);

        const timer = setTimeout(() => {
            setShow(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [trigger]); // ใช้ trigger แทน message

    if (!show) return null;

    return (
        <div style={{
            backgroundColor: '#f8d7da',
            color: '#842029',
            border: '1px solid #f5c2c7',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px',
            fontWeight: '500',
        }}>
            {message}
        </div>
    );
}
