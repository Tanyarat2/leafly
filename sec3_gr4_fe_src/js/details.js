// When the page finishes loading
window.onload = async () => {
  // Parse the URL parameters to get the product ID
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  // If no product ID is found in the URL, show an alert and stop
  if (!productId) {
    alert("Product not found");
    return;
  }

  try {
    // Fetch product details from the backend API using the product ID
    const response = await fetch(`http://localhost:4000/api/product/${productId}`);

    // Check if the response from the server is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response to get product data
    const product = await response.json();

    // Update the page with the product information
    document.querySelector(".product-image-detail").src = product.Product_Img; // Set product image
    document.querySelector(".product-title-detail").innerText = product.Product_Name; // Set product name
    document.querySelector(".product-details-detail p:nth-of-type(1)").innerHTML = product.Description || "No description."; // Set product description
    document.querySelector(".product-details-detail p:nth-of-type(2)").innerHTML = `<strong>Price:</strong> ฿${product.Price}`; // Set product price
  } catch (err) {
    // If any error occurs (network or server error), show an alert and log the error
    console.error("Error loading product:", err);
    alert("Error loading product details.");
  }
};
