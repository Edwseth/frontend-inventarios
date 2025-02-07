// scripts/auth.js


async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.querySelector('button[onclick="handleLogin()"]');

    if (!username || !password) {
        errorMessage.textContent = "Por favor, ingrese usuario y contraseña";
        errorMessage.style.display = "block";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Iniciando sesión...";

    try {
        // ✅ Corrección: pasamos el método y los datos en los parámetros correctos
        const response = await fetchData('/auth/login', "POST", { username, password });

        if (!response) throw new Error("Error en la respuesta del servidor.");

        if (!response.token) throw new Error("No se recibió un token de autenticación.");

        localStorage.setItem('token', response.token);
        window.location.href = 'dashboard.html';

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Iniciar Sesión";
    }
}

