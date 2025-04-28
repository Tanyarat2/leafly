window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // If no product ID is found in the URL, show an alert and stop
  if (!productId) {
    alert("Product not found");
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/product/${productId}`);

    // Check if the response from the server is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }
    
    const product = await response.json();

    // Update the page with the product information
    document.querySelector(".product-image-detail").src = product.Product_Img; // Set product image
    document.querySelector(".product-title-detail").innerText = product.Product_Name; // Set product name
    document.querySelector(".product-details-detail p:nth-of-type(1)").innerHTML = product.Description || "No description."; // Set product description
    document.querySelector(".product-details-detail p:nth-of-type(2)").innerHTML = `<strong>Price:</strong> ฿${product.Price}`; // Set product price
  } catch (err) {

    console.error("Error loading product:", err);
    alert("Error loading product details.");
  }
};
