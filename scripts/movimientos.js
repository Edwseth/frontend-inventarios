// scripts/movimientos.js

class MovimientoForm {
  constructor() {
      this.form = document.getElementById("movimiento-form");
      this.tipoMovimiento = document.getElementById("tipoMovimiento");
      this.fechaInput = document.getElementById("fechaMovimiento");
      this.productoSelect = document.getElementById("productoMovimiento");
      this.cantidadInput = document.getElementById("cantidadMovimiento");
      this.unidadMedida = document.getElementById("unidadMedida");
      this.ubicacionAlmacen = document.getElementById("ubicacionAlmacen");
      this.fechaVencimiento = document.getElementById("fechaVencimiento");
      this.proveedorId = document.getElementById("proveedor");

      this.loadProducts();
      this.loadProveedores();
      this.handleSubmit();
  }

  async loadProducts() {
      try {
          const productos = await fetchData("/api/productos");
          this.productoSelect.innerHTML = `<option value="" disabled selected>Seleccione un producto</option>` + 
          productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");
      } catch (error) {
          console.error("Error cargando productos:", error);
      }
  }

  async loadProveedores() {
    try {
        const proveedores = await fetchData("/api/proveedores");

        this.proveedorId.innerHTML = `
            <option value="" disabled selected>Seleccione un proveedor</option>
            ${proveedores.map(p => `<option value="${p.id}">${p.proveedor}</option>`).join("")}
        `;
    } catch (error) {
        console.error("Error cargando proveedores:", error);
        alert("Error al cargar los proveedores. Intente nuevamente.");
    }
}

  handleSubmit() {
        this.form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const productoId = this.productoSelect.value;
            const cantidad = this.cantidadInput.value;
            const tipo = this.tipoMovimiento.value; // "entrada" o "salida"
            const proveedorId = tipo === "entrada" ? this.proveedorId.value : null;
            const fechaMovimiento = this.fechaInput.value; 
            const unidadMedida = this.unidadMedida.value;
            const ubicacionAlmacen = this.ubicacionAlmacen.value;
            const fechaVencimiento = this.fechaVencimiento.value;

            // ✅ Construimos la URL correcta según el tipo de movimiento
            const url = `/api/productos/${productoId}/${tipo}?cantidad=${cantidad}`;
            const body = {
                // Solo si es entrada, agregamos el proveedor
                ...(proveedorId && { proveedorId }),
                fechaMovimiento,
                unidadMedida,
                ubicacionAlmacen,
                fechaVencimiento
              };

            try {
                await fetchData(url, "POST", body);
                alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada exitosamente`);
                this.form.reset(); // Limpiar formulario después de enviar
            } catch (error) {
                console.error("Error registrando movimiento:", error);
                alert("Error al registrar el movimiento. Intente nuevamente.");
            }
        });
    }

}

// ✅ Inicializar el formulario cuando la página cargue
document.addEventListener("DOMContentLoaded", () => {
  new MovimientoForm();
});
