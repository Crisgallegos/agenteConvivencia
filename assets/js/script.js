
const appScriptUrl = 'https://script.google.com/macros/s/AKfycbx2xLkEkX2xeRivGq6YPtK45oYOw2QTRzHNAynEbLwO0VqdndmoOy9hednk1lM04E3k/exec';

document.addEventListener('DOMContentLoaded', function() {
    const totalAlumnosElement = document.getElementById('totalAlumnos');
    if (totalAlumnosElement) {
        obtenerResumen();
    }

    const formularioIncidente = document.getElementById('formularioIncidente');
    if (formularioIncidente) {
        formularioIncidente.addEventListener('submit', async function(event) {
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
                const response = await fetch(appScriptUrl, { method: 'POST', body: formData });
                const data = await response.json();

                if (data.resultado === 'éxito') {
                    const iaResultados = data.respuestaIA;
                    let textoSugerencia = '';
                    if (iaResultados.reincidente) {
                        textoSugerencia += '⚠️ **ALUMNO REINCIDENTE EN CASOS DE CONVIVENCIA** ⚠️\n\n';
                    }
                    if (iaResultados.no_aplica) {
                        textoSugerencia += `El caso no se ajusta al reglamento actual. Sugerencia para el próximo año: ${iaResultados.sugerencia_reglamento}`;
                    } else {
                        textoSugerencia += `Falta: ${iaResultados.falta}\nArtículo: ${iaResultados.articulo}\nSanción: ${iaResultados.sancion}`;
                    }
                    sugerenciaIA.textContent = textoSugerencia;
                    decisionFinal.value = iaResultados.sancion || iaResultados.sugerencia_reglamento;
                } else {
                    throw new Error(data.mensaje);
                }
            } catch (error) {
                console.error('Error:', error);
                sugerenciaIA.textContent = `Error al analizar el caso: ${error.message}`;
            }
        });

        const formularioGuardar = document.getElementById('formularioGuardar');
        formularioGuardar.addEventListener('submit', async function(event) {
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
                const response = await fetch(appScriptUrl, { method: 'POST', body: formData });
                const data = await response.json();

                if (data.resultado === 'éxito') {
                    alert('¡Éxito! El caso ha sido guardado en el historial.');
                    document.getElementById('formularioIncidente').reset();
                    formularioGuardar.reset();
                    document.getElementById('resultados').style.display = 'none';
                    obtenerResumen();
                } else {
                    throw new Error(data.mensaje);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un error de conexión al guardar.');
            }
        });
    }

    const btnConsultarReglamento = document.getElementById('btnConsultarReglamento');
    if (btnConsultarReglamento) {
        btnConsultarReglamento.addEventListener('click', consultarReglamento);
    }
    
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
                const response = await fetch(appScriptUrl, { method: 'POST', body: formData });
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
});

async function obtenerResumen() {
    const formData = new FormData();
    formData.append('action', 'obtenerResumen');
    const totalAlumnosElement = document.getElementById('totalAlumnos');
    const totalIncidentesElement = document.getElementById('totalIncidentes');
    const totalSancionesElement = document.getElementById('totalSanciones');
    totalAlumnosElement.textContent = '--';
    totalIncidentesElement.textContent = '--';
    totalSancionesElement.textContent = '--';
    try {
        const response = await fetch(appScriptUrl, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.resultado === 'éxito') {
            const resumen = data.resumen;
            totalAlumnosElement.textContent = resumen.totalAlumnos;
            totalIncidentesElement.textContent = resumen.totalIncidentes;
            totalSancionesElement.textContent = resumen.totalSanciones;
        } else {
            console.error('Error al obtener el resumen:', data.mensaje);
            totalAlumnosElement.textContent = 'Error';
            totalIncidentesElement.textContent = 'Error';
            totalSancionesElement.textContent = 'Error';
        }
    } catch (error) {
        console.error('Error de conexión al obtener el resumen:', error);
        totalAlumnosElement.textContent = 'Error';
        totalIncidentesElement.textContent = 'Error';
        totalSancionesElement.textContent = 'Error';
    }
}

async function consultarReglamento() {
    const pregunta = document.getElementById('preguntaReglamento').value;
    const respuestaDiv = document.getElementById('respuestaReglamento');
    const respuestaTexto = document.getElementById('respuestaTexto');

    if (!pregunta) {
        alert('Por favor, escribe tu pregunta.');
        return;
    }

    respuestaTexto.textContent = 'Buscando en el reglamento...';
    respuestaDiv.style.display = 'block';

    const formData = new FormData();
    formData.append('action', 'consultarReglamento');
    formData.append('pregunta', pregunta);

    try {
        const response = await fetch(appScriptUrl, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.resultado === 'éxito') {
            respuestaTexto.textContent = data.respuestaIA;
        } else {
            throw new Error(data.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        respuestaTexto.textContent = `Error al consultar el reglamento: ${error.message}`;
    }
}