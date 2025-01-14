// Obtener la referencia al contenedor del collage
const collageContainer = document.getElementById('collage');

// Función para mostrar las ganancias en forma de collage
function mostrarGanancias() {
    // Obtener el UID del usuario actual
    const user = firebase.auth().currentUser;

    if (user) {
        // Filtrar las ganancias por el UID del usuario actual
        db.collection('profits').where('uid', '==', user.uid).get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const profitData = doc.data();

                    // Crear una tarjeta para cada ganancia
                    const profitCard = document.createElement('div');
                    profitCard.classList.add('profit-card');

                    // Contenido de la tarjeta
                    profitCard.innerHTML = `
                        <h3>Producto: ${profitData.productName}</h3>
                        <p>Cantidad: ${profitData.quantity}</p>
                        <p>Precio de Compra: ${profitData.purchasePrice} pesos</p>
                        <p>Precio de Venta: ${profitData.salePrice} pesos</p>
                        <p>Ganancia: ${profitData.profit} pesos</p>
                        <p>Fecha: ${new Date(profitData.date.seconds * 1000).toLocaleDateString()}</p>
                    `;

                    // Añadir la tarjeta al contenedor del collage
                    collageContainer.appendChild(profitCard);
                });
            })
            .catch((error) => {
                console.error("Error al obtener las ganancias: ", error);
            });
    } else {
        Swal.fire({
            title: 'No autenticado',
            text: 'Debes iniciar sesión para ver tus ganancias.',
            icon: 'warning'
        });
    }
}

// Ejecutar la función al cargar la página
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        mostrarGanancias();
    } else {
        Swal.fire({
            title: 'No autenticado',
            text: 'Debes iniciar sesión para ver tus ganancias.',
            icon: 'warning'
        });
    }
});
// Referencia al botón de reinicio
const reiniciarBtn = document.getElementById('reiniciarGanancias');

// Función para generar y descargar un informe en Excel
function generarInformeExcel(ganancias) {
    // Formato de datos para Excel
    const datosExcel = ganancias.map(g => ({
        Producto: g.productName,
        Cantidad: g.quantity,
        "Precio de Compra": g.purchasePrice,
        "Precio de Venta": g.salePrice,
        Ganancia: g.profit,
        Fecha: new Date(g.date.seconds * 1000).toLocaleDateString(),
    }));

    // Crear hoja de cálculo
    const hoja = XLSX.utils.json_to_sheet(datosExcel);

    // Crear libro de Excel
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Ganancias");

    // Descargar archivo Excel
    XLSX.writeFile(libro, "informe_ganancias.xlsx");
}

// Función para reiniciar ganancias
function reiniciarGanancias() {
    const user = firebase.auth().currentUser;

    if (user) {
        // Obtener todas las ganancias del usuario actual
        db.collection('profits').where('uid', '==', user.uid).get()
            .then((querySnapshot) => {
                const ganancias = [];
                const batch = db.batch(); // Lote para eliminar documentos

                querySnapshot.forEach((doc) => {
                    ganancias.push(doc.data());
                    batch.delete(doc.ref); // Eliminar el documento
                });

                if (ganancias.length > 0) {
                    // Generar el informe en Excel antes de reiniciar
                    generarInformeExcel(ganancias);

                    // Confirmar eliminación
                    return batch.commit().then(() => {
                        
                        Swal.fire({
                            title: 'Ganancias reiniciadas',
                            text: 'Se ha generado un informe y reiniciado las ganancias.',
                            icon: 'success',
                        });
                        mostrarGanancias(); 
                        
                    });
                } else {
                    Swal.fire({
                        title: 'Sin ganancias',
                        text: 'No hay ganancias para reiniciar.',
                        icon: 'info',
                    });
                }
            })
            .catch((error) => {
                console.error("Error al reiniciar ganancias: ", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al reiniciar las ganancias.',
                    icon: 'error',
                });
            });
    } else {
        Swal.fire({
            title: 'No autenticado',
            text: 'Debes iniciar sesión para reiniciar tus ganancias.',
            icon: 'warning',
        });
    }
}

// Vincular evento al botón
reiniciarBtn.addEventListener('click', reiniciarGanancias);
