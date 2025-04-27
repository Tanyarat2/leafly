document.addEventListener('DOMContentLoaded', async () => {
    // เช็คสถานะ Admin
    try {
        const response = await fetch('http://localhost:4000/check-admin', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {  
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        console.log('Welcome admin:', data);
    } catch (error) {
        console.error('Error checking admin status:', error);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                const response = await fetch('http://localhost:4000/admin-logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();
                if (data.success) {
                    console.log('Logout successful');
                    window.location.href = '/login';
                } else {
                    alert('Logout failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('Logout error, please try again.');
            }
        });
    }

    // Form Add Product
    const form = document.getElementById('add-product-form');
    const errorElement = document.getElementById('error');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorElement) errorElement.textContent = '';

            const productImageFile = form.product_image.files[0]; // ดึงไฟล์จากฟอร์ม
            if (!productImageFile) {
                console.error('No image file selected');
                if (errorElement) errorElement.textContent = 'Please select an image.';
                return;
            }

            // ฟังก์ชันแปลงไฟล์เป็น Base64
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });

            let base64Image;
            try {
                base64Image = await toBase64(productImageFile);
            } catch (error) {
                console.error('Error converting image to base64:', error);
                if (errorElement) errorElement.textContent = 'Error converting image.';
                return;
            }

            // เตรียมข้อมูลที่จะส่ง
            const productData = {
                product_id: form.product_id.value,
                product_name: form.product_name.value,
                description: form.description.value,
                color: form.color.value,
                price: parseFloat(form.price.value),
                stock: parseInt(form.stock.value, 10),
                collection: form.collection.value,
                iphone_model: form.iphone_model.value,
                product_image_base64: base64Image, // ส่งภาพ Base64
            };

            console.log('Product Data:', productData);

            try {
                const response = await fetch('http://localhost:4000/add-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productData),
                    credentials: 'include',
                    signal: AbortSignal.timeout(10000),
                });

                const text = await response.text();
                console.log('Response text:', text);

                let result;
                try {
                    result = JSON.parse(text);
                    console.log('Parsed result:', result);
                } catch (jsonError) {
                    console.error('Invalid JSON:', jsonError);
                    throw new Error('Invalid JSON returned from server.');
                }

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to add product', { cause: result });
                }

                if (result.success) {
                    window.location.href = result.redirect || '/admin-page';
                }
            } catch (err) {
                console.error('Error adding product:', err, err.cause);
                if (errorElement) {
                    errorElement.textContent = err.cause?.details || err.message || 'Error adding product';
                }
            }
        });
        // ฟังก์ชันย่อขนาดภาพ
const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = function(event) {
            img.onload = function() {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                
                // คำนวณสัดส่วนการย่อ
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                // ย่อภาพ
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // แปลงเป็น Base64
                canvas.toDataURL('image/jpeg', (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            };
            img.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    });
};

// ใช้ฟังก์ชันในฟอร์ม:
const productImageFile = form.product_image.files[0];
if (productImageFile) {
    resizeImage(productImageFile, 1024, 1024).then((resizedImage) => {
        console.log(resizedImage);
        // ส่ง resizedImage แทน base64 image ขนาดใหญ่
    }).catch(err => {
        console.error('Image resize error:', err);
    });
}

        
    }

    // ฟังก์ชันแสดงรูปตัวอย่าง
    function previewImage(event) {
        const reader = new FileReader();
        reader.onload = function () {
            const preview = document.getElementById('preview');
            if (preview) preview.src = reader.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    const fileInput = document.getElementById('product_image');
    if (fileInput) {
        fileInput.addEventListener('change', previewImage);
    }

    // ถ้า AbortSignal.timeout ยังไม่มีในบราวเซอร์
    if (!AbortSignal.timeout) {
        AbortSignal.timeout = (ms) => {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), ms);
            return controller.signal;
        };
    }
});
