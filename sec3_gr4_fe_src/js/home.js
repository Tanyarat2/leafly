function initMap() {
  console.log("initMap function called");

  // กำหนดพิกัด Leafly Store (สินธร มหิดล)
  const leaflyStore = { lat: 13.7947, lng: 100.3252 };

  // สร้างแผนที่
  const map = new google.maps.Map(document.getElementById("map"), {
    center: leaflyStore,
    zoom: 16,
  });

  // ปักหมุด
  const marker = new google.maps.Marker({
    position: leaflyStore,
    map: map,
    title: "Leafly Store",
  });

  // กล่องข้อความเมื่อคลิกหมุด
  const infowindow = new google.maps.InfoWindow({
    content: "<strong>Leafly Store @ Salaya</strong>",
  });

  // เปิดกล่องข้อความเมื่อคลิกที่หมุด
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });
}

// ทำให้ initMap เป็น global function
window.initMap = initMap;
// ดึงข้อมูลสินค้าตอนโหลดหน้า
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
          // สมมุติ product.Product_Img เป็น base64 มาแล้ว เช่น "data:image/jpeg;base64,...."
          productImage.src = product.Product_Img;
        } else {
          // ถ้าไม่มีรูป เอารูป placeholder แทน
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
