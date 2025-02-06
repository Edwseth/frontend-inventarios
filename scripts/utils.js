// scripts/utils.js
const API_BASE_URL = "http://localhost:8080"; // Ajusta al puerto de tu backend

async function fetchData(endpoint, method = "GET", body = null) {
    if (typeof method !== "string") {
        console.error("⚠ Error: 'method' debe ser un string, pero recibió:", method);
        throw new Error("El método HTTP no es válido.");
    }

    const token = localStorage.getItem("token");
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method: method.toUpperCase(), // Convertir el método a mayúsculas (por seguridad)
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    } else if (method.toUpperCase() === "GET") {
        delete options.body; // Eliminar `body` en solicitudes GET
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.text(); // Leer el error en texto
            throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
        }

        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error("Error en la petición a:", url, "Detalles:", error);
        throw error;
    }
}

// Función para mostrar un indicador de carga
function showLoadingIndicator(container) {
    container.innerHTML = "<p>Cargando...</p>";
}

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

    // Deshabilitar el botón y mostrar indicador de carga
    loginButton.disabled = true;
    loginButton.textContent = "Iniciando sesión...";

    try {
        const data = await fetchData('/auth/login', 'POST', { username, password });
        localStorage.setItem('token', data.token);

        // Redirigir al dashboard después de un breve retraso
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        // Restaurar el botón
        loginButton.disabled = false;
        loginButton.textContent = "Iniciar Sesión";
    }
}