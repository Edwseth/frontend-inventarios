async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
  
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Usuario o contraseña incorrectos');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token);
  
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('dashboard-container').style.display = 'flex';
  
      loadDashboardData(data.token);
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = 'block';
    }
}
  
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('dashboard-container').style.display = 'flex';
      loadDashboardData(token);
  }

  // Manejo de clics en el menú lateral
  const menuItems = ["inicio", "productos", "entradas", "reportes", "alertas"];
  menuItems.forEach(menu => {
      document.getElementById(`menu-${menu}`).addEventListener("click", () => showSection(menu));
  });

  // Agregar evento al botón de cierre de sesión
  document.getElementById("logout-button").addEventListener("click", logout);
});

// Función para mostrar la sección seleccionada
function showSection(section) {
  console.log("Cambiando a sección:", section);

  const content = document.querySelector(".content");
  content.innerHTML = ""; // Limpiar contenido antes de cambiar

  switch (section) {
      case "inicio":
          content.innerHTML = `
              <h1>Dashboard de Inventarios</h1>
              <div class="card">
                  <h2>Productos Críticos</h2>
                  <p id="critical-products-data">Cargando...</p>
              </div>
              <div class="card">
                  <h2>Próximos a Vencer</h2>
                  <p id="expiring-products-data">Cargando...</p>
              </div>
          `;
          const token = localStorage.getItem("token");
          if (token) loadDashboardData(token);
          break;

      case "productos":
          content.innerHTML = `
              <h1>Gestión de Productos</h1>
              <button onclick="listarProductos()">Ver Productos</button>
              <div id="productos-lista"></div>
          `;
          break;

      case "entradas":
          content.innerHTML = `
              <h1>Entradas y Salidas</h1>
              <p>Gestión de movimientos de inventario.</p>
          `;
          break;

      case "reportes":
          content.innerHTML = `
              <h1>Reportes</h1>
              <p>Aquí puedes generar reportes sobre inventario y ventas.</p>
          `;
          break;

      case "alertas":
          content.innerHTML = `
              <h1>Alertas</h1>
              <p>Visualiza alertas de inventario y vencimientos.</p>
          `;
          break;

      default:
          content.innerHTML = "<h1>Página no encontrada</h1>";
  }

  // Resaltar opción activa en el menú
  document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
  document.getElementById(`menu-${section}`).classList.add("active");
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("token");
  window.location.reload(); // Recargar la página para volver a la pantalla de login
}

// 🔹 Función para mostrar la sección seleccionada
function showSection(section) {
  console.log("Cambiando a sección:", section); // Debug

  const content = document.querySelector(".content");
  content.innerHTML = ""; // Limpiar contenido

  switch (section) {
      case "inicio":
          content.innerHTML = `
              <h1>Dashboard de Inventarios</h1>
              <div class="card">
                  <h2>Productos Críticos</h2>
                  <p id="critical-products-data">Cargando...</p>
              </div>
              <div class="card">
                  <h2>Próximos a Vencer</h2>
                  <p id="expiring-products-data">Cargando...</p>
              </div>
          `;
          const token = localStorage.getItem("token");
          if (token) loadDashboardData(token);
          break;

      case "productos":
          content.innerHTML = `
              <h1>Gestión de Productos</h1>
              <button onclick="listarProductos()">Ver Productos</button>
              <div id="productos-lista"></div>
          `;
          break;

      case "entradas":
          content.innerHTML = `
              <h1>Entradas y Salidas</h1>
              <p>Gestión de movimientos de inventario.</p>
          `;
          break;

      case "reportes":
          content.innerHTML = `
              <h1>Reportes</h1>
              <p>Aquí puedes generar reportes sobre inventario y ventas.</p>
          `;
          break;

      case "alertas":
          content.innerHTML = `
              <h1>Alertas</h1>
              <p>Visualiza alertas de inventario y vencimientos.</p>
          `;
          break;

      default:
          content.innerHTML = "<h1>Página no encontrada</h1>";
  }

  // 🔹 Resaltar opción activa en el menú
  document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
  document.getElementById(`menu-${section}`).classList.add("active");
}

// 🔹 Función para obtener y mostrar productos (futura implementación)
async function listarProductos() {
  const token = localStorage.getItem("token");
  try {
      const response = await fetch('http://localhost:8080/productos', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
          }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const productosLista = document.getElementById("productos-lista");
      productosLista.innerHTML = `<ul>${data.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}</ul>`;
  } catch (error) {
      console.error("Error al cargar productos:", error);
  }
}

async function loadDashboardData(token) {
  try {
      console.log("Usando Token:", token); // 🔹 Depuración

      const response = await fetch('http://localhost:8080/productos', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
      });

      if (!response.ok) {
          throw new Error(`Error ${response.status}: No tienes permisos`);
      }

      const data = await response.json();
      console.log("Estructura de los datos recibidos:", data); // 🔹 Depuración

      // Filtrar productos críticos (stock < 10)
      const criticalProducts = data.filter(p => p.stockActual < 10);
      const criticalProductsCount = criticalProducts.length;

      // Filtrar productos con bajo stock (menos de 20 unidades)
      const lowStockProducts = data.filter(p => p.stockActual < 20);
      const lowStockProductsCount = lowStockProducts.length;

      // Mostrar cantidad y nombres de productos críticos
      document.getElementById('critical-products-data').innerHTML = `
          <strong>${criticalProductsCount}</strong> productos por debajo del stock mínimo:<br>
          ${criticalProducts.map(p => `- ${p.nombre} (Stock: ${p.stockActual})`).join('<br>')}
      `;

      // Mostrar cantidad y nombres de productos con bajo stock
      document.getElementById('expiring-products-data').innerHTML = `
          <strong>${lowStockProductsCount}</strong> productos con stock bajo:<br>
          ${lowStockProducts.map(p => `- ${p.nombre} (Stock: ${p.stockActual})`).join('<br>')}
      `;

  } catch (error) {
      console.error("Error al cargar el dashboard:", error);
  }
}




  