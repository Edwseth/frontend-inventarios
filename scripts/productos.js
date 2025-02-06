// scripts/productos.js
class ProductoForm {
    constructor(mode = "create", productoId = null) {
        this.mode = mode; // "create" o "edit"
        this.productoId = productoId; // Solo para modo "edit"
        this.form = this.createForm();
    }

    createForm() {
        const form = document.createElement("form");
        form.id = `producto-form-${this.mode}`;
        form.innerHTML = `
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
        <div class="form-group">
          <label for="categoria">Categoría:</label>
          <select id="categoria" required></select>
        </div>
        <div class="form-group">
          <label for="proveedor">Proveedor:</label>
          <select id="proveedor" required></select>
        </div>
        <button type="submit">${this.mode === "create" ? "Crear" : "Actualizar"} Producto</button>
      `;
      return form;
    }
  
    async loadData() {
      const [categorias, proveedores] = await Promise.all([
          fetchData("/api/categorias"),
          fetchData("/api/proveedores"),
      ]);

      const categoriaSelect = this.form.querySelector("#categoria");
      categoriaSelect.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");

      const proveedorSelect = this.form.querySelector("#proveedor");
      proveedorSelect.innerHTML = proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");

      if (this.mode === "edit" && this.productoId) {
          const producto = await fetchData(`/api/productos/${this.productoId}`);
          this.fillForm(producto);
      }
  }

  fillForm(producto) {
      this.form.querySelector("#nombre").value = producto.nombre;
      this.form.querySelector("#descripcion").value = producto.descripcion;
      this.form.querySelector("#sku").value = producto.sku;
      this.form.querySelector("#stock").value = producto.stock;
      this.form.querySelector("#categoria").value = producto.categoriaId;
      this.form.querySelector("#proveedor").value = producto.proveedorId;
  }

  onSubmit(callback) {
      this.form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const data = {
              nombre: this.form.querySelector("#nombre").value,
              descripcion: this.form.querySelector("#descripcion").value,
              sku: this.form.querySelector("#sku").value,
              stock: this.form.querySelector("#stock").value,
              categoriaId: this.form.querySelector("#categoria").value,
              proveedorId: this.form.querySelector("#proveedor").value,
          };
          await callback(data);
      });
  }
}

// Uso del formulario reutilizable
const crearProductoForm = new ProductoForm("create");
document.getElementById("crear-producto-container").appendChild(crearProductoForm.form);
crearProductoForm.loadData();

crearProductoForm.onSubmit(async (data) => {
  try {
      await fetchData("/api/productos", "POST", data);
      alert("Producto creado exitosamente");
      loadProductList(); // Recargar la lista de productos
  } catch (error) {
      console.error("Error al crear producto:", error);
      alert("Error al crear el producto. Intente nuevamente.");
  }
});
