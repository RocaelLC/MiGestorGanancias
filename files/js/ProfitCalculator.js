
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
            const quantity = document.getElementById('quantity').value;
            const purchasePrice = document.getElementById('purchasePrice').value;
            const salePrice = document.getElementById('salePrice').value;
            const product = document.getElementById('productName').value;
        
            const totalPurchase = quantity * purchasePrice;
            const totalSale = quantity * salePrice;
            const profit = totalSale - totalPurchase;
        
            // Obtener el UID del usuario actual
            const user = firebase.auth().currentUser;
        
            if (user) {
                const profitData = {
                    productName: product,
                    quantity: quantity,
                    purchasePrice: purchasePrice,
                    salePrice: salePrice,
                    profit: profit,
                    date: firebase.firestore.Timestamp.fromDate(new Date()),
                    uid: user.uid // Guardar el UID del usuario
                };
        
                // Guardar los datos en Firestore en la colección 'profits'
                db.collection('profits').add(profitData)
                    .then(() => {
                        Swal.fire({
                            title: `Ganancias: ${profit} pesos`,
                            text: `Se ha generado tus ganancias por el producto ${product}.`,
                            icon: 'success'
                        }).then(() => {
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
        