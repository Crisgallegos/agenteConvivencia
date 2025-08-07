
const appScriptUrl = 'https://script.google.com/macros/s/AKfycbx2xLkEkX2xeRivGq6YPtK45oYOw2QTRzHNAynEbLwO0VqdndmoOy9hednk1lM04E3k/exec';

// ==========================================================
// Lógica para la página principal (index.html)
// ==========================================================
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
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.resultado === 'éxito') {
                const iaResultados = data.respuestaIA;
                let textoSugerencia = '';

                if (iaResultados.reincidente) {
                    textoSugerencia += '⚠️ **ALUMNO REINCIDENTE EN CASOS DE CONVIVENCIA** ⚠️\n\n';
                }

                if (iaResultados.no_aplica) {
                    textoSugerencia += `El caso no se ajusta al reglamento actual.
Sugerencia para el próximo año: ${iaResultados.sugerencia_reglamento}`;
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
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.resultado === 'éxito') {
                alert('¡Éxito! El caso ha sido guardado en el historial.');
                document.getElementById('formularioIncidente').reset();
                formularioGuardar.reset();
                document.getElementById('resultados').style.display = 'none';
            } else {
                throw new Error(data.mensaje);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error de conexión al guardar.');
        }
    });
}
