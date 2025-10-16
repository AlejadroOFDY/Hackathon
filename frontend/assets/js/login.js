document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginUsernameInput = document.getElementById('loginUsername'); 
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginMessageDiv = document.getElementById('loginMessage');

    // ** [CONEXIÓN CON BACKEND ] **
    async function authenticateUser(username, password) {
        try {
            const response = await fetch('/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error de autenticación');
            }

            return { success: true, message: data.message };

        } catch (error) {
            console.error('Error durante la autenticación:', error);
            return { success: false, message: error.message };
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;

        loginMessageDiv.textContent = '';
        loginMessageDiv.className = 'message';

        if (!username || !password) {
            loginMessageDiv.textContent = 'Por favor, ingresa tu usuario y contraseña.';
            loginMessageDiv.classList.add('error');
            return;
        }

        const result = await authenticateUser(username, password);

        if (result.success) {
            loginMessageDiv.textContent = '¡Inicio de sesión exitoso! Redireccionando...';
            loginMessageDiv.classList.add('success');
            
            
            setTimeout(() => {
                window.location.href = '/dashboard.html'; 
            }, 1500);

        } else {
            loginMessageDiv.textContent = result.message;
            loginMessageDiv.classList.add('error');
        }
    });
});