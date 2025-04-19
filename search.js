document.addEventListener('DOMContentLoaded', () => {
  // เรียกค้นหาทั้งหมดทันทีเมื่อโหลดหน้า
  searchProduct(); 
});

function searchProduct(event) {
  if (event) event.preventDefault(); // ป้องกันหน้ารีเฟรช ถ้ามาจาก submit

  const keyword = document.getElementById('keyword').value;
  const model = document.getElementById('model').value;
  const color = document.getElementById('color').value;
  const collection = document.getElementById('collection').value;
  const priceMin = document.querySelector('input[name="price-min"]').value;
  const priceMax = document.querySelector('input[name="price-max"]').value;

  const query = new URLSearchParams({
    keyword,
    model,
    color,
    collection,
    'price-min': priceMin,
    'price-max': priceMax
  });

  fetch(`/search-api?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('resultsContainer');
      container.innerHTML = '';

      if (data.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
      }

      data.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
          <img src="${product.Product_Img}" alt="${product.Product_Name}">
          <p class="product-name">${product.Product_Name}</p>
          <p class="product-price">฿${product.Price}</p>
        `;
        container.appendChild(productDiv);
      });
    })
    .catch(err => {
      console.error('Error fetching search results:', err);
    });
}

// อย่าลืม listener ตอน submit ด้วย
document.querySelector('.search-form').addEventListener('submit', searchProduct);
