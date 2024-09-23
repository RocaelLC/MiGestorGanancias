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
