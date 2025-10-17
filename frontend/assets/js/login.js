document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginUsernameInput = document.getElementById('loginUsername'); 
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginMessageDiv = document.getElementById('loginMessage');

    // ** [CONEXIÓN CON BACKEND ] **
    const API_BASE = 'http://localhost:3000/api'; // Cambia el puerto/host si tu backend usa otro

    async function authenticateUser(username, password) {
            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // necesario para que el navegador guarde la cookie httpOnly desde el backend
                    body: JSON.stringify({ username, password }),
                });

                // Intentar parsear JSON de manera segura
                let data = {};
                try { data = await response.json(); } catch(e) { /* respuesta no JSON */ }

                if (!response.ok) {
                    const msg = data?.message || `Error de autenticación (${response.status})`;
                    throw new Error(msg);
                }

                // Guardar token en localStorage como fallback para entornos donde la cookie no se persiste
                if (data?.token) {
                    try { localStorage.setItem('token', data.token); } catch(e) { /* ignore */ }
                }
                return { success: true, message: data.message || 'Login correcto' };

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
                window.location.href = './index.html'; 
            }, 1500);

        } else {
            loginMessageDiv.textContent = result.message;
            loginMessageDiv.classList.add('error');
        }
    });
});