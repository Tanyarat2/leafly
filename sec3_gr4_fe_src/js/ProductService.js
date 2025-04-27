document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ตรวจสอบสถานะการล็อกอินของแอดมิน
        const response = await fetch('http://localhost:4000/check-admin', {
            method: 'GET',
            credentials: 'include', // ส่งคุกกี้เซสชัน
        });

        if (response.status === 401) { // ถ้าไม่ได้เป็นแอดมิน
            window.location.href = '/login'; // รีไดเรกต์ไปหน้าล็อกอิน
        } else {
            // ถ้าเป็นแอดมินให้ทำสิ่งที่ต้องการในหน้าดูแลแอดมิน
            const data = await response.json();
            console.log('Welcome admin:', data);
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }

    // โหลดข้อมูลสินค้า
    try {
        const productResponse = await fetch('http://localhost:4000/search-api?');
        const products = await productResponse.json();
        const productList = document.getElementById('product-list');

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card-PS';

            card.innerHTML = `
                <a href="detail.html?id=${product.Product_ID}">
                    <img src="${product.Product_Img}" alt="${product.Product_Name}">
                </a>
                <p class="product-name">${product.Product_Name}</p>
                <p class="product-price">฿${product.Price}</p>
            `;

            productList.appendChild(card);
        });

        // เพิ่มปุ่ม "เพิ่มสินค้า"
        const addCard = document.createElement('div');
        addCard.className = 'add-product-card-PS';
        addCard.innerHTML = '<div class="add-icon-PS"><a href="/add-page">+</a></div>';
        productList.appendChild(addCard);
    } catch (err) {
        console.error('Error loading products:', err);
    }

    // ตั้งค่า event listener สำหรับปุ่ม logout
    document.getElementById('logoutBtn').addEventListener('click', async function () {
        try {
            const response = await fetch('http://localhost:4000/admin-logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // ส่งคุกกี้เซสชัน
            });

            const data = await response.json();

            if (data.success) {
                console.log('Logout successful');
                window.location.href = '/login'; // รีไดเรกต์ไปหน้าล็อกอิน
            } else {
                alert('Logout failed: ' + data.message); // แสดงข้อความผิดพลาดถ้ามี
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout error, please try again.');
        }
    });
});

