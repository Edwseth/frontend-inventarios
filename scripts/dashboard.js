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
    const sections = {
        inicio: document.getElementById("inicio-container"),
        productos: document.getElementById("productos-container"),
        movimientos: document.getElementById("movimientos-container"),
        reportes: document.getElementById("reportes-container"),
        alertas: document.getElementById("alertas-container"),
    };

    function showSection(section) {
        Object.values(sections).forEach(sec => sec.style.display = "none"); // Ocultar todas las secciones
        if (sections[section]) {
            sections[section].style.display = "block"; // Mostrar la sección activa
        }
    }

    // Asignar eventos de clic a los botones del menú
    document.getElementById("menu-inicio").addEventListener("click", () => showSection("inicio"));
    document.getElementById("menu-productos").addEventListener("click", () => showSection("productos"));
    document.getElementById("menu-movimientos").addEventListener("click", () => showSection("movimientos"));
    document.getElementById("menu-reportes").addEventListener("click", () => showSection("reportes"));
    document.getElementById("menu-alertas").addEventListener("click", () => showSection("alertas"));

    // Mostrar la sección de inicio por defecto
    showSection("inicio");
});
