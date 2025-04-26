window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
      alert("Product not found");
      return;
  }

  fetch(`http://localhost:4000/api/product/${productId}`)
  .then(res => res.json())
      .then(product => {
          document.querySelector(".product-image-detail").src = product.Product_Img;
          document.querySelector(".product-title-detail").innerText = product.Product_Name;
          document.querySelector(".product-details-detail p:nth-of-type(1)").innerHTML = product.Description || "No description.";
          document.querySelector(".product-details-detail p:nth-of-type(2)").innerHTML = `<strong>Price:</strong> ฿${product.Price}`;
      })
      .catch(err => {
          console.error("Error loading product:", err);
          alert("Error loading product details.");
      });
};