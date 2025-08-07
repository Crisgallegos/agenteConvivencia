const appScriptUrl = 'https://script.google.com/macros/s/AKfycbx2xLkEkX2xeRivGq6YPtK45oYOw2QTRzHNAynEbLwO0VqdndmoOy9hednk1lM04E3k/exec';

// ==========================================================
// Lógica para la página de historial (historial.html)
// ==========================================================
const btnBuscarHistorial = document.getElementById('btnBuscarHistorial');
if (btnBuscarHistorial) {
    btnBuscarHistorial.addEventListener('click', async function() {
        const nombreAlumno = document.getElementById('buscarAlumno').value;
        const historialResultadosDiv = document.getElementById('historialResultados');
        const historialTablaBody = document.getElementById('historialTablaBody');
        const totalFaltas = document.getElementById('totalFaltas');
        const nombreAlumnoHistorial = document.getElementById('nombreAlumnoHistorial');

        if (!nombreAlumno) {
            alert("Por favor, introduce el nombre de un alumno para buscar.");
            return;
        }

        historialTablaBody.innerHTML = '<tr><td colspan="4">Buscando historial...</td></tr>';
        historialResultadosDiv.style.display = 'block';

        const formData = new FormData();
        formData.append('action', 'buscarHistorial');
        formData.append('nombreAlumno', nombreAlumno);

        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.resultado === 'éxito') {
                nombreAlumnoHistorial.textContent = nombreAlumno;
                historialTablaBody.innerHTML = '';
                
                if (data.historial.length > 0) {
                    totalFaltas.textContent = `Total de faltas encontradas: ${data.historial.length}`;
                    data.historial.forEach(falta => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${new Date(falta[0]).toLocaleDateString()}</td>
                            <td>${falta[3]}</td>
                            <td>${falta[4]}</td>
                            <td>${falta[5]}</td>
                        `;
                        historialTablaBody.appendChild(row);
                    });
                } else {
                    totalFaltas.textContent = `No se encontraron faltas para ${nombreAlumno}.`;
                    historialTablaBody.innerHTML = '';
                }
            } else {
                throw new Error(data.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            historialTablaBody.innerHTML = `<tr><td colspan="4">Error al buscar el historial: ${error.message}</td></tr>`;
        }
    });
}


