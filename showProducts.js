// showProducts.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/search-api')
      .then(res => res.json())
      .then(data => {
        const productList = document.getElementById('product-list');
  
        data.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card-PS';
  
          card.innerHTML = `
            <img src="${product.Product_Img}" alt="${product.Product_Name}">
            <p class="product-name">${product.Product_Name}</p>
            <p class="product-price">฿${product.Price}</p>
          `;
  
          productList.appendChild(card);
        });
  
        // เพิ่มปุ่ม Add Product ไว้ท้ายสุด
        const addCard = document.createElement('div');
        addCard.className = 'add-product-card-PS';
        addCard.innerHTML = `<div class="add-icon-PS"><a href="add.html">+</a></div>`;
        productList.appendChild(addCard);
      })
      .catch(err => {
        console.error('Error loading products:', err);
      });
  });
  
