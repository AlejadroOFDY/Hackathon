document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerUsernameInput = document.getElementById('registerUsername');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerRepeatPasswordInput = document.getElementById('registerRepeatPassword');
    const registerMessageDiv = document.getElementById('registerMessage');
    const selectAvatarBtn = document.getElementById('selectAvatarBtn');
    const avatarOptionsDiv = document.getElementById('avatarOptions');
    const registerAvatarPreview = document.getElementById('registerAvatarPreview');

    
    let selectedAvatar = 'assets/img/Cat_1.png';

    const avatars = [
        'assets/img/Cat_1.png',
        'assets/img/Dog_1.png',
        'assets/img/Female_1.png',
        'assets/img/Female_2.png',
        'assets/img/Female_3.png',
        'assets/img/Male_1.png',
        'assets/img/Male_2.png',
        'assets/img/Male_3.png'
    ];

    function loadAvatars() {
        avatarOptionsDiv.innerHTML = '';
        avatars.forEach(avatarPath => {
            const avatarOption = document.createElement('div');
            avatarOption.classList.add('avatar-option');
            if (avatarPath === selectedAvatar) {
                avatarOption.classList.add('selected');
            }
            avatarOption.innerHTML = `<img src="${avatarPath}" alt="Avatar">`;
            avatarOption.dataset.avatar = avatarPath;

            avatarOption.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
                selectedAvatar = avatarPath;
                registerAvatarPreview.querySelector('img').src = selectedAvatar;
                avatarOptionsDiv.style.display = 'none';
            });
            avatarOptionsDiv.appendChild(avatarOption);
        });
        registerAvatarPreview.querySelector('img').src = selectedAvatar;
    }

    selectAvatarBtn.addEventListener('click', () => {
        loadAvatars();
        avatarOptionsDiv.style.display = avatarOptionsDiv.style.display === 'flex' ? 'none' : 'flex';
    });

    loadAvatars();

    async function registerUser(username, email, password) {
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro.');
            }
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error durante el registro:', error);
            return { success: false, message: error.message };
        }
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = registerUsernameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;
        const repeatPassword = registerRepeatPasswordInput.value;
        registerMessageDiv.textContent = '';
        registerMessageDiv.className = 'message';

        if (password !== repeatPassword) {
            registerMessageDiv.textContent = 'Las contraseñas no coinciden.';
            registerMessageDiv.classList.add('error');
            return;
        }

        const result = await registerUser(username, email, password);

        if (result.success) {
            registerMessageDiv.textContent = result.message + ' Serás redirigido al login...';
            registerMessageDiv.classList.add('success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            registerMessageDiv.textContent = result.message;
            registerMessageDiv.classList.add('error');
        }
    });
}); 