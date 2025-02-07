// scripts/movimientos.js

class MovimientoForm {
  constructor() {
      this.form = document.getElementById("movimiento-form");
      this.tipoMovimiento = document.getElementById("tipoMovimiento");
      this.productoSelect = document.getElementById("productoMovimiento");
      this.cantidadInput = document.getElementById("cantidadMovimiento");
      this.fechaInput = document.getElementById("fechaMovimiento");

      this.loadProducts();
      this.handleSubmit();
  }

  async loadProducts() {
      try {
          const productos = await fetchData("/api/productos");
          this.productoSelect.innerHTML = productos.map(p => 
              `<option value="${p.id}">${p.nombre}</option>`).join("");
      } catch (error) {
          console.error("Error cargando productos:", error);
      }
  }

  handleSubmit() {
      this.form.addEventListener("submit", async (event) => {
          event.preventDefault();

          const data = {
              productoId: this.productoSelect.value,
              cantidad: this.cantidadInput.value,
              fecha: this.fechaInput.value,
              tipo: this.tipoMovimiento.value, // "entrada" o "salida"
          };

          try {
              await fetchData("/api/movimientos", "POST", data);
              alert(`${data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1)} registrada exitosamente`);
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
