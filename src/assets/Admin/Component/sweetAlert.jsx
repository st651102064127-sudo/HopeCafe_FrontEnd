// ./Component/sweetAlert.js
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function sweetAlert(type, message, status, function_ = null, image) {
        const imageUrl = `${import.meta.env.VITE_API_URL}`;
        console.log(image);
        
    switch (type) {
        case 'show':

            Swal.fire({
                title: message,
                icon: status,
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                position: 'top-end',
            });
            break;
        case 'delete':
            Swal.fire({
                title: 'ต้องการลบ' + message,
                icon: status,
                showConfirmButton: true,
                showCancelButton: true,
                imageUrl: imageUrl+image,
                confirmButtonColor : '#d33',
              
                
            }).then((res) => {
                if (res.isConfirmed) {
                    function_();
                }
            })
    }
}
