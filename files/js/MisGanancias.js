// Obtener la referencia al contenedor del collage
const collageContainer = document.getElementById('collage');

// Función para mostrar las ganancias en forma de collage
function mostrarGanancias() {
    // Obtener las ganancias desde la colección 'profits' en Firestore
    db.collection('Ganancias').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Obtener los datos de cada documento (ganancia)
            const profitData = doc.data();

            // Crear un div para cada ganancia
            const profitCard = document.createElement('div');
            profitCard.classList.add('profit-card'); // Estilo de tarjeta

            // Contenido de la tarjeta (información de las ganancias)
            profitCard.innerHTML = `
                <h3>Producto: ${profitData.productName}</h3>
                <p>Cantidad: ${profitData.quantity}</p>
                <p>Precio de Compra: ${profitData.purchasePrice} pesos</p>
                <p>Precio de Venta: ${profitData.salePrice} pesos</p>
                <p>Ganancia: ${profitData.Ganancias} pesos</p>
                <p>Fecha: ${new Date(profitData.date.seconds * 1000).toLocaleDateString()}</p>
            `;

            // Añadir la tarjeta al contenedor del collage
            collageContainer.appendChild(profitCard);
        });
    }).catch((error) => {
        console.error("Error al obtener las ganancias: ", error);
    });
}

// Llamar a la función para mostrar las ganancias cuando se cargue la página
window.onload = mostrarGanancias;
