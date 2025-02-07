// scripts/dashboard.js
async function loadDashboardData() {
    const criticalProductsSection = document.getElementById('critical-products-data');
    const lowStockProductsSection = document.getElementById('expiring-products-data');

    // Mostrar indicador de carga
    showLoadingIndicator(criticalProductsSection);
    showLoadingIndicator(lowStockProductsSection);

    try {
        const productos = await fetchData('/api/productos');

        // Mostrar productos críticos
        const criticalProducts = productos.filter(p => p.stockActual < 10);
        criticalProductsSection.innerHTML = `
            <strong>${criticalProducts.length} productos por debajo del stock mínimo.</strong>
            <ul>${criticalProducts.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}</ul>
        `;

        // Mostrar productos con stock bajo
        const lowStockProducts = productos.filter(p => p.stockActual < 20);
        lowStockProductsSection.innerHTML = `
            <strong>${lowStockProducts.length} productos con stock bajo.</strong>
            <ul>${lowStockProducts.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}</ul>
        `;
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        criticalProductsSection.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// scripts/dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado. Redirigiendo al login...");
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos del dashboard
    loadDashboardData();
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM cargado correctamente");

    // Definir las secciones del dashboard
    const sections = {
        inicio: document.getElementById("inicio-container"),
        productos: document.getElementById("productos-container"),
        movimientos: document.getElementById("movimientos-container"),
        reportes: document.getElementById("reportes-container"),
        alertas: document.getElementById("alertas-container"),
    };

    function showSection(section) {
        console.log(`🔄 Mostrando sección: ${section}`);

        // Ocultar todas las secciones
        Object.values(sections).forEach(sec => {
            if (sec) sec.style.display = "none";
        });

        // Mostrar la sección seleccionada
        if (sections[section]) {
            sections[section].style.display = "block";
        } else {
            console.warn(`⚠ Sección no encontrada: ${section}`);
        }
    }

        // ✅ Función para cerrar sesión correctamente
function handleLogout() {
    console.log("🚪 Cerrar sesión ejecutado");
    localStorage.removeItem("token"); // Eliminar el token
    window.location.href = "index.html"; // Redirigir al login
}

// ✅ Event delegation para manejar clics en los botones del menú y "Cerrar Sesión"
const sidebar = document.getElementById("sidebar");

if (sidebar) {
    console.log("📌 Sidebar encontrado, asignando eventos...");
    sidebar.addEventListener("click", (event) => {
        console.log("📌 Click detectado en el sidebar", event.target);

        let button = event.target;

        // Si el usuario hace clic en un <li> en vez de un botón, busca el <button> dentro
        if (button.tagName === "LI") {
            button = button.querySelector("button");
        }

        // Si aún no es un botón, sube en la jerarquía hasta encontrarlo
        while (button && button.tagName !== "BUTTON") {
            button = button.parentElement;
        }

        if (button) {
            console.log(`📌 Botón presionado: ${button.id}`);

            // ✅ Si es el botón de cerrar sesión, llamamos directamente a handleLogout()
            if (button.id === "logout-button") {
                console.log("🚪 Cerrar sesión activado");
                handleLogout();
                return;
            }

            // ✅ Si es un botón de menú, extraemos la sección
            if (button.id.startsWith("menu-")) {
                const sectionName = button.id.replace("menu-", "");
                console.log(`🔄 Intentando mostrar sección: ${sectionName}`);

                if (sections[sectionName]) {
                    showSection(sectionName);
                } else {
                    console.warn(`⚠ Sección no válida: ${sectionName}`);
                }
            } else {
                console.warn("⚠ Botón presionado no es parte del menú.");
            }
        } else {
            console.warn("⚠ No se detectó un botón válido.");
        }
    });
} else {
    console.error("❌ Sidebar no encontrado en el DOM.");
}

    // ✅ Mostrar la sección de inicio por defecto
    showSection("inicio");
});


