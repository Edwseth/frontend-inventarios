// Manejo de Login
async function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('error-message');

  if (!username || !password) {
      errorMessage.textContent = "Por favor, ingrese usuario y contraseña";
      errorMessage.style.display = "block";
      return;
  }

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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Usuario o contraseña incorrectos');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      document.getElementById('login-container').style.display = 'none';
      document.getElementById('dashboard-container').style.display = 'flex';

      showSection("inicio");

  } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = 'block';
  }
}

// Manejo de carga de página
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

  // Manejo del cierre de sesión
  document.getElementById("logout-button").addEventListener("click", logout);

  // Manejo del formulario de creación de productos
  const crearProductoForm = document.getElementById("crear-producto-form");
  if (crearProductoForm) {
      crearProductoForm.addEventListener("submit", async function (event) {
          event.preventDefault();
          await crearProducto();
      });
  }
});

// Función para cambiar de sección
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
                <button id="ver-productos-btn" onclick="listarProductos()">Ver Productos</button>
                <div id="productos-lista"></div>

                <div id="productos-form">
                    <h2>Crear Producto</h2>
                    <form id="crear-producto-form">
                        <div class="form-group">
                            <label for="nombre">Nombre:</label>
                            <input type="text" id="nombre" required>
                        </div>

                        <div class="form-group">
                            <label for="descripcion">Descripción:</label>
                            <textarea id="descripcion" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="sku">SKU:</label>
                            <input type="text" id="sku" required>
                        </div>

                        <div class="form-group">
                            <label for="stock">Stock Inicial:</label>
                            <input type="number" id="stock" required>
                        </div>

                        <button type="submit">Agregar Producto</button>
                    </form>

                    <p id="producto-mensaje" style="color: green; display: none;">Producto creado exitosamente</p>
                </div>
            `;

            document.getElementById("crear-producto-form").addEventListener("submit", async function(event) {
                event.preventDefault();
                await crearProducto();
            });

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
  
    document.querySelectorAll(".sidebar ul li").forEach(li => li.classList.remove("active"));
    document.getElementById(`menu-${section}`).classList.add("active");
}


// Función para cerrar sesión
function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

// Función para listar productos
async function listarProductos() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
      const response = await fetch('http://localhost:8080/api/productos', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
          }
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();

      // Verifica si hay productos en la lista
        if (data.length === 0) {
            document.getElementById("productos-lista").innerHTML = "<p>No hay productos registrados.</p>";
            return;
        }

        // Mostrar la lista de productos con estructura ordenada
        document.getElementById("productos-lista").innerHTML = `
            <h3>Lista de Productos</h3>
            <ul class="lista-productos">
                ${data.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Función para cargar datos del Dashboard
async function loadDashboardData(token) {
    if (!token) return;

    try {
        console.log("Usando Token:", token);

        const response = await fetch('http://localhost:8080/api/productos', {
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

        // Filtramos productos críticos (Stock menor a 10)
        const criticalProducts = data.filter(p => p.stockActual < 10);
        document.getElementById('critical-products-data').innerHTML = `
            <strong>${criticalProducts.length} productos por debajo del stock mínimo.</strong>
            <ul>${criticalProducts.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}</ul>
        `;

        // Filtramos productos próximos a vencer (Stock menor a 20)
        const lowStockProducts = data.filter(p => p.stockActual < 20);
        document.getElementById('expiring-products-data').innerHTML = `
            <strong>${lowStockProducts.length} productos con stock bajo.</strong>
            <ul>${lowStockProducts.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}</ul>
        `;

    } catch (error) {
        console.error("Error al cargar el dashboard:", error);
    }
}



// Función para crear un producto
async function crearProducto() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const producto = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      sku: document.getElementById("sku").value,
      stockActual: parseInt(document.getElementById("stock").value)
  };

  try {
      const response = await fetch("http://localhost:8080/api/productos", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(producto)
      });

      if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo crear el producto`);
      }

      document.getElementById("producto-mensaje").style.display = "block";
      listarProductos(); // Refresca la lista de productos después de agregar uno nuevo
  } catch (error) {
      console.error("Error al crear producto:", error);
  }
}



  