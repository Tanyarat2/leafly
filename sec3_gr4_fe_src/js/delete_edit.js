document.addEventListener('DOMContentLoaded', async () => {
    // Check Admin Status
    try {
      const response = await fetch('http://localhost:4000/check-admin', {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      } else {
        const data = await response.json();
        console.log('Welcome admin:', data);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      window.location.href = '/login';
    }
  
    const searchForm = document.getElementById('search-form');
    const editForm = document.getElementById('edit-form');
    const editFormContainer = document.getElementById('edit-form-container');
    const updateBtn = document.getElementById('update-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const previewImg = document.getElementById('preview');
    const logoutBtn = document.getElementById('logoutBtn');
  
    // Prevent edit form submission
    if (editForm) {
      editForm.addEventListener('submit', (e) => e.preventDefault());
    }
  
    // Image preview function
    window.previewImage = function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
  
    // Convert file to Base64
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  
    // Search form submission
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = document.getElementById('product_id').value;
  
      try {
        console.log('Searching for product ID:', productId);
        const response = await fetch(`http://localhost:4000/edit-product-search?product_id=${encodeURIComponent(productId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
  
        console.log('Search response status:', response.status);
        const responseText = await response.text();
        console.log('Search response text:', responseText);
  
        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            throw new Error(`HTTP error ${response.status}: ${responseText}`);
          }
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
  
        const data = JSON.parse(responseText);
  
        // Populate the edit form
        document.getElementById('edit-product_id').value = data.Product_ID;
        document.getElementById('edit-product_name').value = data.Product_Name;
        document.getElementById('edit-description').value = data.Description;
        document.getElementById('edit-price').value = data.Price;
        document.getElementById('edit-color').value = data.Color;
        document.getElementById('edit-collection').value = data.Collection;
        document.getElementById('edit-iphone_model').value = data.Iphone_Model;
        document.getElementById('edit-stock').value = data.Stock_Quantity;
        document.getElementById('edit-current_image').value = data.Product_Img;
        previewImg.src = data.Product_Img || 'default.png';
  
        // Show the edit form
        editFormContainer.style.display = 'block';
      } catch (error) {
        console.error('Error searching product:', error);
        console.log('Product ID attempted:', productId);
        alert(`Failed to search product: ${error.message}`);
      }
    });
  
    // Update form submission
    updateBtn.addEventListener('click', async () => {
      const productImageFile = editForm.product_image.files[0];
      let base64Image = editForm.current_image.value; 
  
      if (productImageFile) {
        try {
          base64Image = await toBase64(productImageFile);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          alert('Error converting image to base64');
          return;
        }
      }
  
      const productData = {
        product_id: editForm.product_id.value,
        product_name: editForm.product_name.value,
        description: editForm.description.value,
        price: parseFloat(editForm.price.value),
        color: editForm.color.value,
        collection: editForm.collection.value,
        iphone_model: editForm.iphone_model.value,
        stock: parseInt(editForm.stock.value, 10),
        product_image_base64: base64Image,
      };
  
      console.log('Product Data:', productData);
  
      try {
        console.log('Sending edit-product request');
        const response = await fetch('http://localhost:4000/edit-product', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
          credentials: 'include',
          signal: AbortSignal.timeout(10000),
        });
  
        console.log('Edit response status:', response.status);
        const responseText = await response.text();
        console.log('Edit response text:', responseText);
        window.location.href = '/admin-page';
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Invalid JSON:', jsonError);
          throw new Error('Invalid JSON returned from server');
        }
  
        if (!response.ok) {
          throw new Error(result.message || `HTTP error ${response.status}`);
        }
  
        if (!result.success) {
          throw new Error(result.message || 'Update failed');
        }
  
        alert('Product updated successfully');
        editFormContainer.style.display = 'none';
        editForm.reset();
        previewImg.src = 'default.png';
      } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
      }
    });
  
    // Delete product
    deleteBtn.addEventListener('click', async () => {
      const productId = document.getElementById('edit-product_id').value;
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          const response = await fetch(`http://localhost:4000/delete-product/${encodeURIComponent(productId)}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
  
          const result = await response.text();
  
          if (!response.ok) {
            throw new Error(result || 'Error deleting product');
          }
          window.location.href = '/admin-page';
          alert('Product deleted successfully');
          editFormContainer.style.display = 'none';
          editForm.reset();
          previewImg.src = 'default.png';
        } catch (error) {
          console.error('Error deleting product:', error);
          alert(`Failed to delete product: ${error.message}`);
        }
      }
    });
  
    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://localhost:4000/admin-logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
  
          const data = await response.json();
          if (data.success) {
            console.log('Logout successful');
            window.location.href = '/login';
          } else {
            alert('Logout failed: ' + data.message);
          }
        } catch (error) {
          console.error('Error during logout:', error);
          alert('Logout error, please try again.');
        }
      });
    }
  
    // Polyfill for AbortSignal.timeout
    if (!AbortSignal.timeout) {
      AbortSignal.timeout = (ms) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), ms);
        return controller.signal;
      };
    }
  });
