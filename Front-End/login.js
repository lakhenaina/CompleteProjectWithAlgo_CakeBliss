const email = document.getElementById("email");
const password = document.getElementById("password");
const responseMessage = document.getElementById("responseMessage");


async function login(event) {
    event.preventDefault();

    // Reset messages
    responseMessage.textContent = '';

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    const formData = {
        email: emailValue,
        password: passwordValue
    };

    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorText = await response.json();
            responseMessage.textContent = errorText.message;
            return;
        }

        const data = await response.json();
        responseMessage.textContent = data.message;

        email.value = '';
        password.value = '';

        // Store user data in localStorage
        if (data.token) {
          // Admin and customer tokens
          localStorage.setItem('token', data.token);
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('role', data.role);
        }

        const userId = data.userId || (data.user && data.user._id) || data._id || data.id;
        if (userId) {
          localStorage.setItem('userId', userId);
          localStorage.setItem('role', data.role || localStorage.getItem('role'));
        }

        console.log('login success:', { userId, token: data.token, role: data.role, response: data });

        // Redirect based on role
        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "/admin-dashboard.html";
          } else {
            window.location.href = "/customer-dashboard.html";
          }
        }, 500);


    } catch (error) {
        console.error('Error:', error);
        responseMessage.textContent = 'Oops!! Something Went Wrong!';
    }
    function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
}
