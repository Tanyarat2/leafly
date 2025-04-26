document.addEventListener('DOMContentLoaded', async () => {

    // ----------- เช็คสถานะ Admin -----------
    try {
        const response = await fetch('http://localhost:4000/check-admin', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {  // ใช้ response.ok แทนการใช้ status === 401
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        console.log('Welcome admin:', data);
    } catch (error) {
        console.error('Error checking admin status:', error);
    }


    // ----------- Logout -----------
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

    // ----------- Form Add Product -----------
    const form = document.getElementById('add-product-form');
    const errorElement = document.getElementById('error');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (errorElement) errorElement.textContent = '';

            const formData = new FormData(form);

            try {
                const response = await fetch('http://localhost:3000/add-product', {
                    method: 'POST',
                    body: formData,
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
    }
});

// ฟังก์ชันแสดงรูปตัวอย่าง
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const preview = document.getElementById('preview');
        if (preview) preview.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// ถ้า AbortSignal.timeout ยังไม่มีในบราวเซอร์
if (!AbortSignal.timeout) {
    AbortSignal.timeout = (ms) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), ms);
        return controller.signal;
    };
}

