
    const appScriptUrl = 'https://script.google.com/macros/s/AKfycbx2xLkEkX2xeRivGq6YPtK45oYOw2QTRzHNAynEbLwO0VqdndmoOy9hednk1lM04E3k/exec';

    // Funciones para manejar los formularios de Análisis y Guardado (sin cambios)
    document.getElementById('formularioIncidente').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nombreAlumno = document.getElementById('nombreAlumno').value;
        const cursoAlumno = document.getElementById('cursoAlumno').value;
        const descripcion = document.getElementById('descripcionIncidente').value;
        const resultadosDiv = document.getElementById('resultados');
        const sugerenciaIA = document.getElementById('sugerenciaIA');
        const decisionFinal = document.getElementById('decisionFinal');

        sugerenciaIA.textContent = "Analizando el caso con la IA... por favor, espera.";
        resultadosDiv.style.display = 'block';

        const formData = new FormData();
        formData.append('action', 'analizar');
        formData.append('nombreAlumno', nombreAlumno);
        formData.append('cursoAlumno', cursoAlumno);
        formData.append('descripcionIncidente', descripcion);

        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.resultado === 'éxito') {
                const iaResultados = data.respuestaIA;

                sugerenciaIA.textContent = `Falta: ${iaResultados.falta}\nArtículo: ${iaResultados.articulo}\nSanción: ${iaResultados.sancion}`;
                
                decisionFinal.value = iaResultados.sancion;

            } else {
                throw new Error(data.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            sugerenciaIA.textContent = `Error al analizar el caso: ${error.message}`;
        }
    });

    document.getElementById('formularioGuardar').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const nombreAlumno = document.getElementById('nombreAlumno').value;
        const cursoAlumno = document.getElementById('cursoAlumno').value;
        const descripcion = document.getElementById('descripcionIncidente').value;
        const sugerenciaIA = document.getElementById('sugerenciaIA').textContent;
        const decisionFinal = document.getElementById('decisionFinal').value;
        
        const formData = new FormData();
        formData.append('action', 'guardar');
        formData.append('nombreAlumno', nombreAlumno);
        formData.append('cursoAlumno', cursoAlumno);
        formData.append('descripcionIncidente', descripcion);
        formData.append('sugerenciaIA', sugerenciaIA);
        formData.append('decisionFinal', decisionFinal);

        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.resultado === 'éxito') {
                alert('¡Éxito! El caso ha sido guardado en el historial.');
                document.getElementById('formularioIncidente').reset();
                document.getElementById('formularioGuardar').reset();
                document.getElementById('resultados').style.display = 'none';
            } else {
                throw new Error(data.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error de conexión al guardar.');
        }
    });

    // NUEVA FUNCIÓN para buscar en el historial
    document.getElementById('btnBuscarHistorial').addEventListener('click', async function() {
        const nombreAlumno = document.getElementById('buscarAlumno').value;
        const historialResultadosDiv = document.getElementById('historialResultados');
        const historialTablaBody = document.getElementById('historialTablaBody');
        const totalFaltas = document.getElementById('totalFaltas');
        const nombreAlumnoHistorial = document.getElementById('nombreAlumnoHistorial');

        if (!nombreAlumno) {
            alert("Por favor, introduce el nombre de un alumno para buscar.");
            return;
        }

        // Mostrar el estado de carga
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
                historialTablaBody.innerHTML = ''; // Limpiar resultados anteriores
                
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
