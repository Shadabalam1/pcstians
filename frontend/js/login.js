const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Page reload hone se rokega
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Backend API ko request bhejenge
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Token ko browser ke localStorage mein save karein
            localStorage.setItem('adminToken', data.token);
            alert('Login Successful!');
            // Upload page par redirect karein
            window.location.href = 'upload.html';
        } else {
            errorMsg.innerText = data.message || 'Login failed';
        }
    } catch (error) {
        console.error(error);
        errorMsg.innerText = 'Server error. Please make sure backend is running.';
    }
});