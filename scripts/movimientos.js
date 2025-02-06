// scripts/movimientos.js
class MovimientoForm {
  constructor(type) {
    this.type = type; // "entrada" o "salida"
    this.form = this.createForm();
  }

  createForm() {
    const form = document.createElement("form");
    form.id = `movimiento-${this.type}-form`;
    form.innerHTML = `
      <div class="form-group">
        <label for="producto-${this.type}">Producto:</label>
        <select id="producto-${this.type}" required></select>
      </div>
      <div class="form-group">
        <label for="cantidad-${this.type}">Cantidad:</label>
        <input type="number" id="cantidad-${this.type}" required>
      </div>
      <div class="form-group">
        <label for="fecha-${this.type}">Fecha:</label>
        <input type="date" id="fecha-${this.type}" required>
      </div>
      <button type="submit">Registrar ${this.type}</button>
    `;
    return form;
  }

  async loadProducts() {
    const productos = await fetchData("/api/productos");
    const select = this.form.querySelector(`#producto-${this.type}`);
    select.innerHTML = productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");
  }

  onSubmit(callback) {
    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = {
        productoId: this.form.querySelector(`#producto-${this.type}`).value,
        cantidad: this.form.querySelector(`#cantidad-${this.type}`).value,
        fecha: this.form.querySelector(`#fecha-${this.type}`).value,
        tipo: this.type,
      };
      await callback(data);
    });
  }
}

// Uso del formulario reutilizable
const entradaForm = new MovimientoForm("entrada");
const salidaForm = new MovimientoForm("salida");

document.getElementById("entrada-container").appendChild(entradaForm.form);
document.getElementById("salida-container").appendChild(salidaForm.form);

entradaForm.loadProducts();
salidaForm.loadProducts();

entradaForm.onSubmit(async (data) => {
  await fetchData("/api/movimientos", "POST", data);
  alert("Entrada registrada exitosamente");
});

salidaForm.onSubmit(async (data) => {
  await fetchData("/api/movimientos", "POST", data);
  alert("Salida registrada exitosamente");
});