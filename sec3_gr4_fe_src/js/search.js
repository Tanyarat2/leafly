document.addEventListener('DOMContentLoaded', () => {
  // Show when search with no criteria / show all product
  searchProduct();
});

// Function to go back to the previous page
function closeSearch() {
  window.history.back();
}

// Function to search for products based on the form input
function searchProduct(event) {
  if (event) event.preventDefault();

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

  // Send a request to the back-end with the search query
  fetch(`http://localhost:4000/search-api?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      const container = document.getElementById('resultsContainer');
      container.innerHTML = ''; // Clear previous results

      if (data.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
      }

      data.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
          <a href="detail.html?id=${product.Product_ID}">
            <img src="${product.Product_Img}" alt="${product.Product_Name}">
          </a>
          <p class="product-name">${product.Product_Name}</p>
          <p class="product-price">฿${product.Price}</p>
        `;
        container.appendChild(productDiv); // Add to the container
      });
    })
    .catch(err => {
      console.error('Error fetching search results:', err);
    });
}

document.querySelector('.search-form').addEventListener('submit', searchProduct);
