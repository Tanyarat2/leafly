function initMap() {
  console.log("initMap function called");

  // Leafly Store location (สินธร มหิดล)
  const leaflyStore = { lat: 13.7947, lng: 100.3252 };

  // Maps
  const map = new google.maps.Map(document.getElementById("map"), {
    center: leaflyStore,
    zoom: 16,
  });

  // Maps marker
  const marker = new google.maps.Marker({
    position: leaflyStore,
    map: map,
    title: "Leafly Store",
  });

  // Message box when click Maps marker
  const infowindow = new google.maps.InfoWindow({
    content: "<strong>Leafly Store @ Salaya</strong>",
  });

  // Open message box when click Maps marker
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });
}

// Make initMap global function
window.initMap = initMap;
// Pull product indormation when loading
function fetchProducts() {
  fetch('http://localhost:4000/api/products')
    .then(response => response.json())
    .then(products => {
      console.log('Products:', products);
      const productContainer = document.getElementById('product-container');
      const seenNames = new Set();

      const NewCollectionProducts = products
        .filter(product => product.Collection === "Samote")
        .filter(product => {
          if (seenNames.has(product.Product_Name)) {
            return false;
          }
          seenNames.add(product.Product_Name);
          return true;
        })
        .slice(0, 5);

      NewCollectionProducts.forEach(product => {
        console.log(`Product ID for ${product.Product_Name}: ${product.Product_ID}`);
        const productElement = document.createElement('a');
        productElement.classList.add('product');
        productElement.href = `detail.html?id=${product.Product_ID}`;

        const productImage = document.createElement('img');

        if (product.Product_Img) {
          
          productImage.src = product.Product_Img;
        } else {
          // If no picture use placeholder instead
          productImage.src = 'placeholder.jpg';
        }

        productImage.alt = product.Product_Name;

        const productName = document.createElement('p');
        productName.classList.add('product-name');
        productName.textContent = product.Product_Name;

        const productPrice = document.createElement('p');
        productPrice.classList.add('product-price');
        productPrice.textContent = `฿${product.Price}`;

        productElement.appendChild(productImage);
        productElement.appendChild(productName);
        productElement.appendChild(productPrice);

        productContainer.appendChild(productElement);
      });
    })
    .catch(error => console.error('Error fetching products:', error));
}

window.onload = fetchProducts;
