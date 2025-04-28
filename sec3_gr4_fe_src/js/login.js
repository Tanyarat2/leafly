document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault(); 

        // Get values from the form inputs
        const admin_id = document.getElementById('admin_id').value;
        const password = document.getElementById('password').value;
        const captcha = document.getElementById('captcha').checked;

        // Validate if checkbox is checked
        if (!captcha) {
            alert('Please confirm you are not a robot.');
            return;
        }

        try {
            // Send login request to the server
            const response = await fetch('http://localhost:4000/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ admin_id, password }),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = data.redirectUrl;
            } else {
                alert(data.message || 'Login failed');
            }

        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed. Please try again.');
        }
    });
});
