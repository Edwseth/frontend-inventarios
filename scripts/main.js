// main.js
document.addEventListener("DOMContentLoaded", () => {
  loadProductList();

  // Inicializar el formulario de creación
  const crearProductoForm = new ProductoForm("create");
  document.getElementById("crear-producto-container").appendChild(crearProductoForm.form);
  crearProductoForm.loadData();

  crearProductoForm.onSubmit(async (data) => {
    try {
      const response = await fetchData("/api/productos", "POST", data);
      alert("Producto creado exitosamente");
      loadProductList(); // Recargar la lista de productos
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert("Error al crear el producto. Intente nuevamente.");
    }
  });
});