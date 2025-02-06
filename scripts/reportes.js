// scripts/reportes.js
async function cargarReporte() {
    const tipoReporte = document.getElementById("tipo-reporte").value;
    const contenido = document.getElementById("reporte-contenido");

    // Mostrar indicador de carga
    showLoadingIndicator(contenido);

    try {
        const data = await fetchData(`/api/reportes/${tipoReporte}`);
        mostrarReporte(data, tipoReporte);
    } catch (error) {
        console.error("Error al cargar el reporte:", error);
        contenido.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function mostrarReporte(data, tipoReporte) {
    const contenido = document.getElementById("reporte-contenido");

    if (!data || Object.keys(data).length === 0) {
        contenido.innerHTML = `<p style="color: red;">No hay datos disponibles para este reporte.</p>`;
        return;
    }

    let html = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    // Generar tabla según el tipo de reporte
    html += '</table>';
    contenido.innerHTML = html;
}

function exportarPDF() {
    const elemento = document.getElementById("reporte-contenido");
    if (!elemento || !elemento.innerHTML.trim()) {
        alert("No hay datos para exportar.");
        return;
    }
    html2pdf().from(elemento).save("reporte.pdf");
}

function exportarExcel() {
    const tabla = document.getElementById("reporte-contenido").querySelector("table");
    if (!tabla) {
        alert("No hay datos para exportar.");
        return;
    }
    const workbook = XLSX.utils.table_to_book(tabla);
    XLSX.writeFile(workbook, 'reporte.xlsx');
}