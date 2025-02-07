// scripts/productos.js
document.addEventListener("DOMContentLoaded", () => {
  const btnListar = document.getElementById("btn-listar-productos");
  const btnCrear = document.getElementById("btn-crear-producto");
  const contenidoProductos = document.getElementById("contenido-productos");

  btnListar.addEventListener("click", async () => {
      const productos = await fetchData("/api/productos");
      mostrarListaProductos(productos);
  });

  btnCrear.addEventListener("click", () => {
      mostrarFormularioCrear();
  });

  function mostrarListaProductos(productos) {
      contenidoProductos.innerHTML = productos.length ? `
          <h3>Lista de Productos</h3>
          <table border="1">
              <thead>
                  <tr>
                      <th>Nombre</th>
                      <th>SKU</th>
                      <th>Categoría</th>
                      <th>Proveedor</th>
                      <th>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  ${productos.map(producto => `
                      <tr>
                          <td>${producto?.nombre || "Sin nombre"}</td>
                          <td>${producto?.sku || "N/A"}</td>
                          <td>${producto?.categoria || "N/A"}</td>
                          <td>${producto?.proveedor?.nombre || "N/A"}</td>
                          <td>
                              <button class="editar-producto" data-id="${producto.id}">Editar</button>
                              <button class="eliminar-producto" data-id="${producto.id}">Eliminar</button>
                          </td>
                      </tr>
                  `).join("")}
              </tbody>
          </table>
      ` : "<p>No hay productos disponibles.</p>";
  }

  function mostrarFormularioCrear() {
      contenidoProductos.innerHTML = `
          <h3>Crear Producto</h3>
          <form id="producto-form">
              <label>Nombre: <input type="text" id="nombre" required></label>
              <label>Comentarios: <textarea id="comentarios"></textarea></label>
              <label>SKU: <input type="text" id="sku" required></label>
              <label>Lote Proveedor: <input type="text" id="loteProveedor"></label>
              <label>Lote Interno: <input type="text" id="loteInterno"></label>
              <label>Ubicación en Almacén: <input type="text" id="ubicacionAlmacen"></label>
              <label>Unidad de Medida: <input type="text" id="unidadMedida"></label>
              <label>Costo Promedio: <input type="number" id="costoPromedio" step="0.01" required></label>
              <label>Fecha de Ingreso: <input type="date" id="fechaIngreso"></label>
              <label>Fecha de Vencimiento: <input type="date" id="fechaVencimiento"></label>
              <label>Estado: 
                  <select id="estado"required>
                      <option value="Activo">Seleccione una opción</option>
                      <option value="Activo">ACTIVO</option>
                      <option value="Descontinuado">DESCONTINUADO</option>
                      <option value="En Tránsito">EN_TRANSITO</option>
                  </select>
              </label>
              <label>Categoría: <select id="categoria" required></select></label>
              <label>Subcategoría:
                  <select id="subcategoria"required>
                       <option value="Activo">Seleccione una opción</option>
                       <option value="solidos">SOLIDOS</option>
                       <option value="liquidos">LIQUIDOS</option>
                       <option value="semisolidos">SEMISOLIDOS</option>
                  </select>
              </label>
              <label>Proveedor: <select id="proveedor" required></select></label>
              <button type="submit">Crear Producto</button>
          </form>
      `;
      loadFormData();
      document.getElementById("producto-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const data = {
              nombre: document.getElementById("nombre").value,
              comentarios: document.getElementById("comentarios").value,
              sku: document.getElementById("sku").value,
              loteProveedor: document.getElementById("loteProveedor").value,
              loteInterno: document.getElementById("loteInterno").value,
              ubicacionAlmacen: document.getElementById("ubicacionAlmacen").value,
              unidadMedida: document.getElementById("unidadMedida").value,
              costoPromedio: document.getElementById("costoPromedio").value,
              fechaIngreso: document.getElementById("fechaIngreso").value,
              fechaVencimiento: document.getElementById("fechaVencimiento").value,
              estado: document.getElementById("estado").value,
              categoria: document.getElementById("categoria").value,
              subcategoria: document.getElementById("subcategoria").value,
              proveedorId: document.getElementById("proveedor").value
          };
          try {
              await fetchData("/api/productos", "POST", data);
              alert("Producto creado exitosamente");
              btnListar.click();
          } catch (error) {
              console.error("Error al crear producto:", error);
              alert("Error al crear el producto.");
          }
      });
  }

  async function loadFormData() {
    try {
        const [categorias, proveedores] = await Promise.all([
            fetchData("/api/categorias"), 
            fetchData("/api/proveedores")
        ]);

        console.log("Categorías cargadas:", categorias);
        console.log("Proveedores cargados:", proveedores);

        document.getElementById("categoria").innerHTML = 
            `<option value="">Seleccione una opción</option>` + 
            categorias.map(c => `<option value="${c}">${c.replace("_", " ")}</option>`).join("");

        document.getElementById("proveedor").innerHTML = 
            `<option value="">Seleccione una opción</option>` + 
            proveedores.map(p => `<option value="${p.id}">${p.proveedor}</option>`).join("");

    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

});

