document.addEventListener('DOMContentLoaded', async () => {
    // ----------- เช็คสถานะ Admin -----------
    try {
        const response = await fetch('http://localhost:4000/check-admin', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        } else {
            const data = await response.json();
            console.log('Welcome admin:', data);
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }

    // ----------- ค้นหาสินค้า -----------
    const searchForm = document.getElementById('search-form');
    if (!searchForm) {
        console.error('Search form not found!');
        return;
    }

    // 2. คำสั่งอื่นๆ ที่จะใช้ searchForm
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product_id').value;

        try {
            const res = await fetch(`http://localhost:4000/edit-product-search/${id}`);
            if (!res.ok) throw new Error('Product not found.');

            const product = await res.json();

            // เติมข้อมูลลงฟอร์ม
            document.getElementById('edit-product_id').value = product.Product_ID;
            document.getElementById('edit-product_name').value = product.Product_Name;
            document.getElementById('edit-description').value = product.Description;
            document.getElementById('edit-price').value = product.Price;
            document.getElementById('edit-color').value = product.Color;
            document.getElementById('edit-collection').value = product.Collection;
            document.getElementById('edit-iphone_model').value = product.Iphone_Model;
            document.getElementById('edit-stock').value = product.Stock_Quantity;
            document.getElementById('preview').src = product.Product_Img;
            document.getElementById('edit-current_image').value = product.Product_Img;
            document.getElementById('edit-form-container').style.display = 'block';

        } catch (err) {
            alert(err.message);
        }
    });

    
    // ----------- อัปเดตสินค้า -----------
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            const form = document.getElementById('edit-form');
            const formData = new FormData(form);

            try {
                const res = await fetch('/edit-product', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Failed to update product');
                }

                alert('Product updated successfully!');
                window.location.href = '/admin-page'; // รีไดเรกต์กลับไปหน้าแอดมิน
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // ----------- Logout -----------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:4000/admin-logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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

});
