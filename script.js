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

// Función genérica para manejar peticiones fetch
async function fetchData(url, method = 'GET', body = null) {
  const token = localStorage.getItem("token");
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
}

// Uso de la función genérica en lugar de repetir código
async function cargarProductos(selectores = [], llenarFormulario = false) {
  try {
    const data = await fetchData('http://localhost:8080/api/productos');

    // Verifica si hay productos en la respuesta
    if (!data || data.length === 0) {
      console.warn("No hay productos disponibles.");
      return;
    }

    // Función para actualizar los selectores según la categoría
    function actualizarSelectProductos(categoria, selectId) {
      const selectElement = document.getElementById(selectId);
      if (!selectElement) return;

      // Filtrar productos según la categoría seleccionada
      const productosFiltrados = data.filter(p => p.categoria === categoria);

      // Llenar el select con los productos filtrados
      selectElement.innerHTML = productosFiltrados.length > 0
        ? productosFiltrados.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')
        : `<option value="">No hay productos disponibles</option>`;
    }

    // Asignar eventos a los selectores de categoría (para Entradas y Salidas)
    const categoriaEntrada = document.getElementById("categoria-entrada");
    const categoriaSalida = document.getElementById("categoria-salida");

    if (categoriaEntrada) {
      categoriaEntrada.addEventListener("change", function () {
        actualizarSelectProductos(this.value, "producto-entrada");
      });
    }

    if (categoriaSalida) {
      categoriaSalida.addEventListener("change", function () {
        actualizarSelectProductos(this.value, "producto-salida");
      });
    }

    // Llenar los selectores si se proporcionan (Sin filtrado)
    if (selectores.length > 0) {
      selectores.forEach(selectorId => {
        const selectElement = document.getElementById(selectorId);
        if (selectElement) {
          selectElement.innerHTML = data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
      });
    }

    // Llenar el formulario con el primer producto si está habilitado
    if (llenarFormulario) {
      const primerProducto = data[0]; // Se usa el primer producto de la lista

      document.getElementById("nombre").value = primerProducto.nombre || "";
      document.getElementById("descripcion").value = primerProducto.descripcion || "";
      document.getElementById("sku").value = primerProducto.sku || "";
      document.getElementById("stock").value = primerProducto.stockActual || 0;
      document.getElementById("categoria").value = primerProducto.categoria || "";
      document.getElementById("subcategoria").value = primerProducto.subcategoria || "";
      document.getElementById("ubicacionAlmacen").value = primerProducto.ubicacionAlmacen || "";
      document.getElementById("unidadMedida").value = primerProducto.unidadMedida || "";
      document.getElementById("costoUnitario").value = primerProducto.costoUnitario || 0;
      document.getElementById("proveedor").value = primerProducto.proveedorId || "";
      document.getElementById("fechaIngreso").value = primerProducto.fechaIngreso || "";
      document.getElementById("fechaVencimiento").value = primerProducto.fechaVencimiento || "";
      document.getElementById("estado").value = primerProducto.estado || "";
    }

    console.log("Productos cargados y listos para filtrar por categoría.");
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}


// ✅ Cargar almacenes en los selectores correspondientes
async function cargarAlmacenes() {
  try {
    const data = await fetchData('http://localhost:8080/api/almacenes');

    if (!data || data.length === 0) {
      console.warn("No hay almacenes disponibles.");
      return;
    }

    // 🔹 Buscar los selectores de almacenes en entrada y salida
    const selectsAlmacenes = [
      document.getElementById("almacen-entrada"),
      document.getElementById("almacen-salida")
    ];

    selectsAlmacenes.forEach(select => {
      if (select) {
        select.innerHTML = data.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
      }
    });

    console.log("Almacenes cargados exitosamente.");
  } catch (error) {
    console.error("Error al cargar almacenes:", error);
  }
}




// Función para listar productos
async function listarProductos() {
  try {
    const data = await fetchData('http://localhost:8080/api/productos');

    if (!data || data.length === 0) {
      document.getElementById("productos-lista").innerHTML = "<p>No hay productos registrados.</p>";
      return;
    }

    document.getElementById("productos-lista").innerHTML = `
        <h3>Lista de Productos</h3>
        <ul class="lista-productos">
            ${data.map(p => `<li>${p.nombre} (Stock: ${p.stockActual})</li>`).join('')}
        </ul>
    `;

    console.log("Productos listados correctamente.");
  } catch (error) {
    console.error("Error al listar productos:", error);
  }
}

// Cargar proveedores en el formulario de productos usando fetchData
async function cargarProveedores() {
  try {
      const data = await fetchData('http://localhost:8080/api/proveedores');

      if (!data || data.length === 0) {
          console.warn("No hay proveedores disponibles.");
          return;
      }

      // 🔹 Seleccionar los <select> para proveedores en productos y movimientos
      const selectsProveedores = [
          document.getElementById("proveedor"),
          document.getElementById("proveedor-entrada")
      ];

      selectsProveedores.forEach(select => {
          if (select) {
              select.innerHTML = data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
          }
      });

      console.log("Proveedores cargados exitosamente.");
  } catch (error) {
      console.error("Error al cargar proveedores:", error);
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

      setTimeout(() => {
        cargarProveedores();
    }, 500);

  // Manejo de clics en el menú lateral
  const menuItems = ["inicio", "productos", "movimientos", "reportes", "alertas"];
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

// Modificar la función showSection para agregar los botones
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
            <div class="botones">
                <button id="ver-productos-btn" onclick="toggleListaProductos()">Ver Productos</button>
                <button id="crear-producto-btn" onclick="toggleFormularioProducto()">Crear Producto</button>
            </div>

            <div id="productos-lista" style="display: none;"></div>

            <div id="productos-form" style="display: none;">
                <h2>Crear Producto</h2>
                <form id="crear-producto-form">
                    
                    <!-- Información básica del producto -->
                    <fieldset>
                        <legend>Información Básica</legend>
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
                    </fieldset>

                    <!-- Stock y Ubicación -->
                    <fieldset>
                        <legend>Stock y Ubicación</legend>
                        <div class="form-group">
                            <label for="stock">Stock Inicial:</label>
                            <input type="number" id="stock" required>
                        </div>

                        <div class="form-group">
                            <label for="categoria">Categoría:</label>
                            <select id="categoria" required>
                                <option value="">Seleccione una categoría</option>
                                <option value="materia_prima">Materia Prima</option>
                                <option value="material_empaque">Material de Empaque</option>
                                <option value="material_rotulado">Material de Rotulado</option>
                                <option value="producto_terminado">Producto Terminado</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="subcategoria">Subcategoría:</label>
                            <input type="text" id="subcategoria">
                        </div>

                        <div class="form-group">
                            <label for="ubicacionAlmacen">Ubicación en Almacén:</label>
                            <input type="text" id="ubicacionAlmacen">
                        </div>
                    </fieldset>

                    <!-- Información de compra -->
                    <fieldset>
                        <legend>Datos de Compra</legend>
                        <div class="form-group">
                            <label for="proveedor">Proveedor:</label>
                            <select id="proveedor">
                                <option value="">Seleccione un proveedor</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="unidadMedida">Unidad de Medida:</label>
                            <input type="text" id="unidadMedida" required>
                        </div>

                        <div class="form-group">
                            <label for="costoUnitario">Costo Unitario:</label>
                            <input type="number" step="0.01" id="costoUnitario" required>
                        </div>
                    </fieldset>

                    <!-- Fechas y Estado -->
                    <fieldset>
                        <legend>Fechas y Estado</legend>
                        <div class="form-group">
                            <label for="fechaIngreso">Fecha de Ingreso:</label>
                            <input type="date" id="fechaIngreso">
                        </div>

                        <div class="form-group">
                            <label for="fechaVencimiento">Fecha de Vencimiento:</label>
                            <input type="date" id="fechaVencimiento">
                        </div>

                        <div class="form-group">
                            <label for="estado">Estado:</label>
                            <select id="estado">
                                <option value="disponible">Disponible</option>
                                <option value="agotado">Agotado</option>
                                <option value="descontinuado">Descontinuado</option>
                            </select>
                        </div>
                    </fieldset>

                    <button type="submit">Agregar Producto</button>
                </form>

                <p id="producto-mensaje" style="color: green; display: none;">Producto creado exitosamente</p>
            </div>
        `;

        // ✅ Escuchar evento de formulario para creación de producto
        document.getElementById("crear-producto-form").addEventListener("submit", async function (event) {
            event.preventDefault();
            await crearProducto();
        });

        // ✅ Escuchar cambios en la categoría para filtrar productos
        const categoriaSelect = document.getElementById("categoria");
        if (categoriaSelect) {
            categoriaSelect.addEventListener("change", function () {
                cargarProductos([], true);
            });
        }

        // ✅ Cargar productos en el formulario de gestión
        cargarProductos([], true);

        setTimeout(() => {
          cargarProveedores();
      }, 200);

        break;
      
      case "movimientos":
        content.innerHTML = `
            <div id="movimientos-container">
                <h1>Movimientos de Inventario</h1>
    
                <!-- Registrar Entrada -->
                <div class="card">
                    <h2>Registrar Entrada</h2>
                    <form id="entrada-form">
                        
                        <div class="form-group">
                            <label for="categoria-entrada">Categoría del Material:</label>
                            <select id="categoria-entrada" required>
                                <option value="">Seleccione una categoría</option>
                                <option value="materia_prima">Materia Prima</option>
                                <option value="material_empaque">Material de Empaque</option>
                                <option value="material_rotulado">Material de Rotulado</option>
                                <option value="producto_terminado">Producto Terminado</option>
                            </select>
                        </div>
    
                        <div class="form-group">
                            <label for="producto-entrada">Producto/Material:</label>
                            <select id="producto-entrada" required></select>
                        </div>
    
                        <div class="form-group">
                            <label for="lote-entrada">Número de Lote:</label>
                            <input type="text" id="lote-entrada">
                        </div>
    
                        <div class="form-group">
                            <label for="cantidad-entrada">Cantidad:</label>
                            <input type="number" id="cantidad-entrada" required>
                        </div>
    
                        <div class="form-group">
                            <label for="unidad-medida-entrada">Unidad de Medida:</label>
                            <input type="text" id="unidad-medida-entrada">
                        </div>
    
                        <div class="form-group">
                            <label for="almacen-entrada">Almacén:</label>
                            <select id="almacen-entrada">
                                <option value="">Seleccione un almacén</option>
                            </select>
                        </div>
    
                        <div class="form-group">
                            <label for="proveedor-entrada">Proveedor:</label>
                            <select id="proveedor-entrada">
                                <option value="">Seleccione un proveedor</option>
                            </select>
                        </div>
    
                        <div class="form-group">
                            <label for="fecha-entrada">Fecha de Entrada:</label>
                            <input type="date" id="fecha-entrada">
                        </div>
    
                        <div class="form-group">
                            <label for="orden-compra">Orden de Compra:</label>
                            <input type="text" id="orden-compra">
                        </div>
    
                        <div class="form-group">
                            <label for="responsable-entrada">Responsable:</label>
                            <input type="text" id="responsable-entrada">
                        </div>
    
                        <div class="form-group">
                            <label for="observaciones-entrada">Observaciones:</label>
                            <textarea id="observaciones-entrada"></textarea>
                        </div>
    
                        <button type="submit">Registrar Entrada</button>
                    </form>
                    <p id="entrada-mensaje" style="color: green; display: none;">Entrada registrada exitosamente</p>
                </div>
    
                <!-- Registrar Salida -->
                <div class="card">
                    <h2>Registrar Salida</h2>
                    <form id="salida-form">
    
                        <div class="form-group">
                            <label for="categoria-salida">Categoría del Material:</label>
                            <select id="categoria-salida" required>
                                <option value="">Seleccione una categoría</option>
                                <option value="materia_prima">Materia Prima</option>
                                <option value="material_empaque">Material de Empaque</option>
                                <option value="material_rotulado">Material de Rotulado</option>
                                <option value="producto_terminado">Producto Terminado</option>
                            </select>
                        </div>
    
                        <div class="form-group">
                            <label for="producto-salida">Producto/Material:</label>
                            <select id="producto-salida" required></select>
                        </div>
    
                        <div class="form-group">
                            <label for="lote-salida">Número de Lote:</label>
                            <input type="text" id="lote-salida">
                        </div>
    
                        <div class="form-group">
                            <label for="cantidad-salida">Cantidad:</label>
                            <input type="number" id="cantidad-salida" required>
                        </div>
    
                        <div class="form-group">
                            <label for="unidad-medida-salida">Unidad de Medida:</label>
                            <input type="text" id="unidad-medida-salida">
                        </div>
    
                        <div class="form-group">
                            <label for="almacen-salida">Almacén:</label>
                            <select id="almacen-salida">
                                <option value="">Seleccione un almacén</option>
                            </select>
                        </div>
    
                        <div class="form-group">
                            <label for="cliente-salida">Cliente/Destinatario:</label>
                            <input type="text" id="cliente-salida">
                        </div>
    
                        <div class="form-group">
                            <label for="fecha-salida">Fecha de Salida:</label>
                            <input type="date" id="fecha-salida">
                        </div>
    
                        <div class="form-group">
                            <label for="orden-produccion">Orden de Producción:</label>
                            <input type="text" id="orden-produccion">
                        </div>
    
                        <div class="form-group">
                            <label for="responsable-salida">Responsable:</label>
                            <input type="text" id="responsable-salida">
                        </div>
    
                        <div class="form-group">
                            <label for="observaciones-salida">Observaciones:</label>
                            <textarea id="observaciones-salida"></textarea>
                        </div>
    
                        <button type="submit">Registrar Salida</button>
                    </form>
                    <p id="salida-mensaje" style="color: green; display: none;">Salida registrada exitosamente</p>
                </div>
            </div>
        `;
    
        // 🔹 Ahora los elementos ya existen en el DOM, podemos llamarlos correctamente
          setTimeout(() => {
            cargarProductos(["producto-entrada", "producto-salida"]);
            cargarProveedores();  // ✅ Pasamos el ID correcto
            cargarAlmacenes(["almacen-entrada", "almacen-salida"]);
        }, 0);

        // ✅ Manejar el envío del formulario de entrada
        document.getElementById("entrada-form").addEventListener("submit", registrarEntrada);

        // ✅ Manejar el envío del formulario de salida
        document.getElementById("salida-form").addEventListener("submit", registrarSalida);
        break;
        
        
  
      case "reportes":
        content.innerHTML = `
        <h1>Reportes</h1>
        <div class="card">
          <h2>Seleccione un Reporte</h2>
          <select id="tipo-reporte">
            <option value="stock">Reporte de Stock y Disponibilidad</option>
            <option value="movimientos">Reporte de Movimientos de Inventario</option>
            <option value="rotacion">Reporte de Rotación de Productos</option>
            <option value="inventario-fisico">Reporte de Inventario Físico</option>
          </select>
          <button onclick="cargarReporte()">Generar Reporte</button>
        </div>

        <div class="card" id="reporte-resultado">
          <h2>Resultado del Reporte</h2>
          <div id="reporte-contenido">
            <!-- Aquí se mostrará el contenido del reporte -->
          </div>
          <button onclick="exportarPDF()">Exportar a PDF</button>
          <button onclick="exportarExcel()">Exportar a Excel</button>
        </div>
      `;

        // Llamar a la función para cargar el reporte automáticamente
        cargarReporte();
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

// Función para crear un producto con los nuevos campos
async function crearProducto() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const producto = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      sku: document.getElementById("sku").value,
      stockActual: parseInt(document.getElementById("stock").value),
      categoria: document.getElementById("categoria").value,
      subcategoria: document.getElementById("subcategoria").value,
      ubicacionAlmacen: document.getElementById("ubicacionAlmacen").value,
      unidadMedida: document.getElementById("unidadMedida").value,
      costoUnitario: parseFloat(document.getElementById("costoUnitario").value),
      proveedorId: parseInt(document.getElementById("proveedor").value),
      fechaIngreso: document.getElementById("fechaIngreso").value,
      fechaVencimiento: document.getElementById("fechaVencimiento").value,
      estado: document.getElementById("estado").value
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
      setTimeout(() => {
          document.getElementById("producto-mensaje").style.display = "none";
      }, 3000);
  } catch (error) {
      console.error("Error al crear producto:", error);
  }
}

// Ejecutar carga de proveedores cuando se cargue la página
window.onload = function() {
  cargarProveedores();
};

// Función para mostrar/ocultar el formulario de creación de productos
function toggleFormularioProducto() {
    const formulario = document.getElementById("productos-form");
    if (formulario.style.display === "none" || formulario.style.display === "") {
      formulario.style.display = "block";
    } else {
      formulario.style.display = "none";
    }
}
  
// Función para mostrar/ocultar la lista de productos
function toggleListaProductos() {
  const listaProductos = document.getElementById("productos-lista");
  if (listaProductos.style.display === "none" || listaProductos.style.display === "") {
    listaProductos.style.display = "block";
    listarProductos(); // Cargar la lista de productos si está oculta
  } else {
    listaProductos.style.display = "none";
  }
}
  
// Manejo del menú hamburguesa
document.getElementById("menu-toggle").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
});

// Función para registrar una entrada de inventario
async function registrarEntrada(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return;

  const productoId = document.getElementById("producto-entrada").value;
  const cantidad = document.getElementById("cantidad-entrada").value;

  try {
    const response = await fetch(`http://localhost:8080/api/productos/${productoId}/entrada?cantidad=${cantidad}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo registrar la entrada`);
    }

    const data = await response.json();
    document.getElementById("entrada-mensaje").style.display = "block";
    setTimeout(() => {
      document.getElementById("entrada-mensaje").style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Error al registrar entrada:", error);
  }
}

// Función para registrar una salida de inventario
async function registrarSalida(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return;

  const productoId = document.getElementById("producto-salida").value;
  const cantidad = document.getElementById("cantidad-salida").value;

  try {
    const response = await fetch(`http://localhost:8080/api/productos/${productoId}/salida?cantidad=${cantidad}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo registrar la salida`);
    }

    const data = await response.json();
    document.getElementById("salida-mensaje").style.display = "block";
    setTimeout(() => {
      document.getElementById("salida-mensaje").style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Error al registrar salida:", error);
  }
}

// Función para cargar el reporte seleccionado
async function cargarReporte() {
  try {
      const tipoReporte = document.getElementById("tipo-reporte").value;
      const data = await fetchData(`http://localhost:8080/api/reportes/${tipoReporte}`);
      mostrarReporte(data, tipoReporte);
  } catch (error) {
      console.error("Error al cargar el reporte:", error);
      document.getElementById("reporte-contenido").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}



// Función para mostrar el reporte en la UI
function mostrarReporte(data, tipoReporte) {
  const contenido = document.getElementById("reporte-contenido");

  // Validación de datos antes de generar el reporte
  if (!data || Object.keys(data).length === 0) {
      contenido.innerHTML = `<p style="color: red;">No hay datos disponibles para este reporte.</p>`;
      document.querySelector("button[onclick='exportarPDF()']").disabled = true;
      document.querySelector("button[onclick='exportarExcel()']").disabled = true;
      return;
  } else {
      document.querySelector("button[onclick='exportarPDF()']").disabled = false;
      document.querySelector("button[onclick='exportarExcel()']").disabled = false;
  }

  let html = '<table border="1" style="width: 100%; border-collapse: collapse;">';

  switch (tipoReporte) {
      case "stock":
          html += '<tr><th>Producto</th><th>Stock</th><th>Disponibilidad</th></tr>';
          for (const producto in data) {
              const detalles = data[producto];
              html += `<tr>
                <td>${producto}</td>
                <td>${detalles.stock}</td>
                <td>${detalles.disponibilidad}</td>
              </tr>`;
          }
          break;

      case "movimientos":
          html += '<tr><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Fecha</th></tr>';
          data.forEach(movimiento => {
              html += `<tr>
                <td>${movimiento.producto.nombre}</td>
                <td>${movimiento.tipo}</td>
                <td>${movimiento.cantidad}</td>
                <td>${movimiento.fecha}</td>
              </tr>`;
          });
          break;

      case "rotacion":
          html += '<tr><th>Producto</th><th>Rotación</th></tr>';
          for (const producto in data) {
              const rotacion = data[producto];
              html += `<tr>
                <td>${producto}</td>
                <td>${rotacion}</td>
              </tr>`;
          }
          break;

      case "inventario-fisico":
          html += '<tr><th>Producto</th><th>Stock Físico</th><th>Stock Sistema</th></tr>';
          for (const producto in data) {
              const detalles = data[producto];
              html += `<tr>
                <td>${producto}</td>
                <td>${detalles.stockFisico}</td>
                <td>${detalles.stockSistema}</td>
              </tr>`;
          }
          break;

      default:
          html += '<tr><th>Error</th></tr>';
          html += `<tr><td>No se pudo generar el reporte.</td></tr>`;
  }

  html += '</table>';
  contenido.innerHTML = html;
}


// Función para exportar a PDF
function exportarPDF() {
  const contenido = document.getElementById("reporte-contenido").innerHTML;
  const doc = new jsPDF();
  doc.fromHTML(contenido, 15, 15, { width: 180 });
  doc.save('reporte.pdf');
}

// Función para exportar a Excel
function exportarExcel() {
  const tabla = document.getElementById("reporte-contenido").querySelector("table");
  const workbook = XLSX.utils.table_to_book(tabla);
  XLSX.writeFile(workbook, 'reporte.xlsx');
}