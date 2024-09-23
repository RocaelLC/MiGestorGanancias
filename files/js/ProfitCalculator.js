
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
   
// Función para calcular las ganancias
function calculateProfit() {
    const quantity = document.getElementById('quantity').value;
    const purchasePrice = document.getElementById('purchasePrice').value;
    const salePrice = document.getElementById('salePrice').value;
    const product = document.getElementById('productName').value;

    // Cálculo de las ganancias
    const totalPurchase = quantity * purchasePrice;
    const totalSale = quantity * salePrice;
    const profit = totalSale - totalPurchase;

    // Datos a guardar en Firestore
    const profitData = {
        productName: product,
        quantity: quantity,
        purchasePrice: purchasePrice,
        salePrice: salePrice,
        profit: profit,
        date: firebase.firestore.Timestamp.fromDate(new Date())  // Fecha de registro
    };

    // Guardar los datos en Firestore en la colección 'profits'
    db.collection('Ganancias').add(profitData)
        .then(() => {
            // Mostrar alerta con SweetAlert cuando los datos se guarden correctamente
            Swal.fire({
                title: `Ganancias: ${profit} pesos`,
                text: `Se ha generado tus ganancias por el producto ${product}.`,
                icon: 'success'
            }).then(() => {
                // Limpiar el formulario después de que se cierre el SweetAlert
                document.getElementById('productName').value = '';
                document.getElementById('quantity').value = '';
                document.getElementById('purchasePrice').value = '';
                document.getElementById('salePrice').value = '';
            });
        })
        .catch((error) => {
            // Manejo de errores si ocurre un problema al guardar en Firestore
            Swal.fire({
                title: 'Error',
                text: `Hubo un problema al guardar las ganancias: ${error.message}`,
                icon: 'error'
            });
        });
}
