document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check admin login status by calling backend API
        const response = await fetch('http://localhost:4000/check-admin', {
            method: 'GET',
            credentials: 'include', // Send session cookie with the request
        });

        if (response.status === 401) {
            // If not logged in as admin, redirect to login page
            window.location.href = '/login';
        } else {
            // If admin is authenticated, continue to load the admin page
            const data = await response.json();
            console.log('Welcome admin:', data);
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }

    // Load product data and render product cards
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

        // Add card
        const addCard = document.createElement('div');
        addCard.className = 'add-product-card-PS';
        addCard.innerHTML = '<div class="add-icon-PS"><a href="/add-page">+</a></div>';
        productList.appendChild(addCard);
    } catch (err) {
        console.error('Error loading products:', err);
    }

    // Set up event listener for the logout button
    document.getElementById('logoutBtn').addEventListener('click', async function () {
        try {
            const response = await fetch('http://localhost:4000/admin-logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Send session cookie with the request
            });

            const data = await response.json();

            if (data.success) {
                console.log('Logout successful');
                // Redirect to login page after successful logout
                window.location.href = '/login'; 
            } else {
                alert('Logout failed: ' + data.message); 
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Logout error, please try again.');
        }
    });
});

