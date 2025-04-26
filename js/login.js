document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // กัน form reload หน้า

        const admin_id = document.getElementById('admin_id').value;
        const password = document.getElementById('password').value;
        const captcha = document.getElementById('captcha').checked;

        if (!captcha) {
            alert('Please confirm you are not a robot.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ admin_id, password }),
                credentials: 'include' // สำคัญมาก!! เพื่อให้ cookie session วิ่งไปด้วย
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
