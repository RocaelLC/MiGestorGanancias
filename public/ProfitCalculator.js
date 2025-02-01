
        // Configuración de Firebase (usa tu propia configuración)
const firebaseConfig = {
    apiKey: "AIzaSyB0g3hI2fFBf8dD5rYkt00IY6iyKf0HoUU",
    authDomain: "migestor-fc269.firebaseapp.com",
    projectId: "migestor-fc269",
    storageBucket: "migestor-fc269.appspot.com",
    messagingSenderId: "901999644556",
    appId: "1:901999644556:web:d39a8aebd3a22069ca10a9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa Firestore
const db = firebase.firestore();

function calculateProfit() {
    const product = document.getElementById('productName').value.trim();
    const quantity = parseFloat(document.getElementById('quantity').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const salePrice = parseFloat(document.getElementById('salePrice').value);

    // Validaciones de entrada
    if (!product) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingresa el nombre del producto.',
            icon: 'error'
        });
        return;
    }

    if (isNaN(quantity) || quantity <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'La cantidad debe ser un número mayor a 0.',
            icon: 'error'
        });
        return;
    }

    if (isNaN(purchasePrice) || purchasePrice <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'El precio de compra debe ser un número mayor a 0.',
            icon: 'error'
        });
        return;
    }

    if (isNaN(salePrice) || salePrice <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'El precio de venta debe ser un número mayor a 0.',
            icon: 'error'
        });
        return;
    }

    // Cálculo de las ganancias
    const totalPurchase = quantity * purchasePrice;
    const totalSale = quantity * salePrice;
    const profit = totalSale - totalPurchase;

    // Validar autenticación del usuario
    const user = firebase.auth().currentUser;

    if (user) {
        const profitData = {
            productName: product,
            quantity: quantity,
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            profit: profit,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
            uid: user.uid // Guardar el UID del usuario autenticado
        };

        // Guardar los datos en Firestore
        db.collection('profits').add(profitData)
            .then(() => {
                Swal.fire({
                    title: `Ganancias: ${profit.toFixed(2)} pesos`,
                    text: `Se ha generado tus ganancias por el producto "${product}".`,
                    icon: 'success'
                }).then(() => {
                    // Limpiar los campos del formulario
                    document.getElementById('productName').value = '';
                    document.getElementById('quantity').value = '';
                    document.getElementById('purchasePrice').value = '';
                    document.getElementById('salePrice').value = '';
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error',
                    text: `Hubo un problema al guardar las ganancias: ${error.message}`,
                    icon: 'error'
                });
            });
    } else {
        Swal.fire({
            title: 'No autenticado',
            text: 'Debes estar autenticado para guardar ganancias.',
            icon: 'warning'
        });
    }
}
