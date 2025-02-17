// Obtener la referencia al contenedor del collage y al contenedor de ganancias totales
const collageContainer = document.getElementById('collage');
const gananciasTotalesContainer = document.createElement('div'); // Crear un contenedor para mostrar las ganancias totales

// Referencia al contenedor donde se mostrará la gráfica
const graficaContainer = document.getElementById('grafica');

// Función para mostrar las ganancias en forma de collage y calcular el total
function mostrarGanancias() {
    const user = firebase.auth().currentUser;

    if (user) {
        db.collection('profits').where('uid', '==', user.uid).get()
            .then((querySnapshot) => {
                let totalGanancias = 0; // Variable para acumular las ganancias totales
                const productosGanancia = {}; // Objeto para almacenar las ganancias por producto
                collageContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas tarjetas

                querySnapshot.forEach((doc) => {
                    const profitData = doc.data();
                    const producto = profitData.productName;
                    const ganancia = profitData.profit;

                    // Acumular la ganancia de cada producto
                    totalGanancias += ganancia;

                    // Sumar las ganancias por producto
                    if (productosGanancia[producto]) {
                        productosGanancia[producto] += ganancia;
                    } else {
                        productosGanancia[producto] = ganancia;
                    }

                    // Crear una tarjeta para cada ganancia
                    const profitCard = document.createElement('div');
                    profitCard.classList.add('profit-card');

                    // Contenido de la tarjeta
                    profitCard.innerHTML = `
                        <h3>Producto: ${producto}</h3>
                        <p>Cantidad: ${profitData.quantity}</p>
                        <p>Precio de Compra: ${profitData.purchasePrice} pesos</p>
                        <p>Precio de Venta: ${profitData.salePrice} pesos</p>
                        <p>Ganancia: ${ganancia} pesos</p>
                        <p>Fecha: ${new Date(profitData.date.seconds * 1000).toLocaleDateString()}</p>
                        <button class="btn-volver">Editar</button>
                    `;

                    // Agregar evento de clic para editar
                    
                    profitCard.addEventListener('click', () => {
                        Swal.fire({
                            title: 'Editar Ganancia',
                            html: `
                                <label for="producto">Producto:</label>
                                <input id="producto" class="swal2-input" value="${producto}">
                                <label for="cantidad">Cantidad:</label>
                                <input id="cantidad" type="number" class="swal2-input" value="${profitData.quantity}">
                                <label for="precioCompra">Precio de Compra:</label>
                                <input id="precioCompra" type="number" class="swal2-input" value="${profitData.purchasePrice}">
                                <label for="precioVenta">Precio de Venta:</label>
                                <input id="precioVenta" type="number" class="swal2-input" value="${profitData.salePrice}">
                        
                                `,
                            showCancelButton: true,
                            confirmButtonText: 'Guardar',
                            cancelButtonText: 'Cancelar',
                            preConfirm: () => {
                                const producto = document.getElementById('producto').value;
                                const cantidad = parseFloat(document.getElementById('cantidad').value);
                                const precioCompra = parseFloat(document.getElementById('precioCompra').value);
                                const precioVenta = parseFloat(document.getElementById('precioVenta').value);
                                const ganancia = cantidad * (precioVenta - precioCompra);

                                if (!producto || isNaN(cantidad) || isNaN(precioCompra) || isNaN(precioVenta)) {
                                    Swal.showValidationMessage('Por favor, completa todos los campos correctamente.');
                                    return;
                                }

                                return { producto, cantidad, precioCompra, precioVenta, ganancia };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const { producto, cantidad, precioCompra, precioVenta, ganancia } = result.value;

                                // Actualizar en Firebase
                                db.collection('profits').doc(doc.id).update({
                                    productName: producto,
                                    quantity: cantidad,
                                    purchasePrice: precioCompra,
                                    salePrice: precioVenta,
                                    profit: ganancia
                                }).then(() => {
                                    Swal.fire({
                                        title: 'Éxito',
                                        text: 'La ganancia se actualizó correctamente.',
                                        icon: 'success'
                                    });
                                    // Volver a mostrar las ganancias para reflejar los cambios
                                    mostrarGanancias();
                                }).catch((error) => {
                                    console.error("Error al actualizar la ganancia: ", error);
                                    Swal.fire({
                                        title: 'Error',
                                        text: 'Hubo un problema al actualizar la ganancia.',
                                        icon: 'error'
                                    });
                                });
                            }
                        });
                    });

                    collageContainer.appendChild(profitCard);
                });

                // Mostrar las ganancias totales
                gananciasTotalesContainer.innerHTML = `
                    <div class="profit-summary">
                        <h2>Ganancia Total: ${totalGanancias.toFixed(2)} pesos</h2>
                    </div>
                `;

                // Asegurarse de que el contenedor de ganancias totales se agregue al final del collage
                document.body.appendChild(gananciasTotalesContainer);  // Insertar al final de la página

                // Preparar los datos para la gráfica de barras
                const productos = Object.keys(productosGanancia);
                const ganancias = productos.map(producto => productosGanancia[producto]);

                // Crear la gráfica de barras
                new Chart(graficaContainer, {
                    type: 'bar',
                    data: {
                        labels: productos, // Etiquetas con el nombre de los productos
                        datasets: [{
                            label: 'Ganancia por Producto',
                            data: ganancias, // Datos de ganancias
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        responsive: true
                    }
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
                        }).then(() => {
                            // Refrescar la visualización de ganancias
                            mostrarGanancias(); // Llamar de nuevo a la función para recargar el collage y gráfica
                        });
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

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión
        window.location.href = "index.html";
    } else {
        // El usuario está autenticado, muestra el contenido de la página principal
        console.log("Bienvenido", user.email);
    }
});
function goBack() {
    window.history.back();
}