// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB0g3hI2fFBf8dD5rYkt00IY6iyKf0HoUU",
    authDomain: "migestor-fc269.firebaseapp.com",
    projectId: "migestor-fc269",
    storageBucket: "migestor-fc269.appspot.com",
    messagingSenderId: "901999644556",
    appId: "1:901999644556:web:d39a8aebd3a22069ca10a9"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Inicializa Firestore
const storage = firebase.storage();

// Verifica si el usuario está autenticado
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        loadProducts(); // Carga los productos si el usuario está autenticado
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Debes iniciar sesión para ver tus productos',
            icon: 'error'
        });
    }
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('stock').value;
    const imageFile = document.getElementById('productImage').files[0]; // Obtiene el archivo de imagen

    if (!imageFile) {
        Swal.fire({
            title: 'Error',
            text: 'Debes subir una imagen',
            icon: 'error'
        });
        return;
    }

    // Generar un nombre único para la imagen usando un timestamp
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`images/${Date.now()}_${imageFile.name}`);

    try {
        // Sube la imagen a Firebase Storage
        const snapshot = await imageRef.put(imageFile);
        const imageUrl = await snapshot.ref.getDownloadURL(); // Obtén la URL de descarga

        // Agrega el producto a Firestore con la URL de la imagen y un ID generado automáticamente
        await db.collection('productos').add({
            name: name,
            price: price,
            image: imageUrl,
            stock: stock,
            userId: firebase.auth().currentUser.uid // Guarda el ID del usuario
        });

        // Limpia el formulario
        document.getElementById('productForm').reset();

        // Muestra la alerta de éxito
        Swal.fire({
            title: 'Éxito',
            text: 'Hemos registrado tu producto',
            icon: 'success'
        });

        loadProducts(); // Carga los productos después de agregar uno nuevo
    } catch (error) {
        console.error("Error al agregar producto: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al agregar el producto',
            icon: 'error'
        });
    }
});

async function loadProducts() {
    const productsList = document.getElementById('products');
    productsList.innerHTML = ''; // Limpia la lista

    const userId = firebase.auth().currentUser.uid; // Obtiene el ID del usuario autenticado
    const snapshot = await db.collection('productos').where('userId', '==', userId).get(); // Filtra productos por usuario
    snapshot.forEach(doc => {
        const product = doc.data();
        const card = document.createElement('div');
        card.className = 'product-card'; // Añade la clase para el estilo

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Precio: ${product.price} pesos</p>
            <p>Stock: ${product.stock}</p>
            <button class="btn-eliminar" data-id="${doc.id}">Eliminar</button> <!-- Botón de eliminar -->
            
        `;

        productsList.appendChild(card);
    });

    // Añadir event listeners para los botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', deleteProduct);
    });
}

async function deleteProduct(e) {
    const productId = e.target.dataset.id; // Obtén el ID del producto a eliminar

    try {
        await db.collection('productos').doc(productId).delete(); // Elimina el producto de Firestore

        // Muestra la alerta de éxito
        Swal.fire({
            title: 'Éxito',
            text: 'Producto eliminado correctamente',
            icon: 'success'
        });

        loadProducts(); // Recarga los productos después de eliminar uno
    } catch (error) {
        console.error("Error al eliminar producto: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al eliminar el producto',
            icon: 'error'
        });
    }
}
