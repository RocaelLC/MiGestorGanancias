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

// Evento de formulario para agregar un producto
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('stock').value;
    const imageFile = document.getElementById('productImage').files[0];

    if (!imageFile) {
        Swal.fire({
            title: 'Error',
            text: 'Debes subir una imagen',
            icon: 'error'
        });
        return;
    }

    const storageRef = storage.ref();
    const imageRef = storageRef.child(`images/${Date.now()}_${imageFile.name}`);

    try {
        const snapshot = await imageRef.put(imageFile);
        const imageUrl = await snapshot.ref.getDownloadURL(); // Obtén la URL de descarga

        await db.collection('productos').add({
            name: name,
            price: price,
            image: imageUrl,
            stock: parseInt(stock),
            userId: firebase.auth().currentUser.uid
        });

        document.getElementById('productForm').reset();
        Swal.fire({
            title: 'Éxito',
            text: 'Hemos registrado tu producto',
            icon: 'success'
        });

        loadProducts(); // Recarga los productos
    } catch (error) {
        console.error("Error al agregar producto: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al agregar el producto',
            icon: 'error'
        });
    }
});

// Función para cargar productos
async function loadProducts() {
    const productsList = document.getElementById('products');
    productsList.innerHTML = ''; // Limpia la lista de productos

    const userId = firebase.auth().currentUser.uid;
    const snapshot = await db.collection('productos').where('userId', '==', userId).get();

    snapshot.forEach(doc => {
        const product = doc.data();
        const card = document.createElement('div');
        card.className = 'product-card';

        // Verifica el stock y muestra alerta si es menor a 5
        if (product.stock < 5) {
            Swal.fire({
                title: 'Alerta',
                text: `El producto ${product.name} tiene solo ${product.stock} unidades en stock.`,
                icon: 'warning'
            });
        }

        // Se agrega un contenedor para la imagen con un ícono de edición superpuesto
        card.innerHTML = `
            <div class="product-image-container" style="position: relative; display: inline-block;">
                <img src="${product.image}" alt="${product.name}">
                <span class="btn-edit" data-id="${doc.id}" 
                    style="position: absolute; top: 10 px; left: 10px; cursor: pointer; background: rgba(255,255,255,0.7); padding: 5px; border-radius: 50%;">
                    ✎
                </span>
            </div>
            <h3>${product.name}</h3>
            <p>Precio: ${product.price} pesos</p>
            <p>Stock: ${product.stock}</p>
            <button class="btn-eliminar" data-id="${doc.id}">Eliminar</button>
            <input type="number" id="cantidad-${doc.id}"  class="cantidad-input" placeholder="Vendido hoy" min="1">
            <button class="btn-descuento" data-id="${doc.id}">Descontar Stock</button>
            <input type="number" id="cantidad-add-${doc.id}" class="cantidad-input2" placeholder="Añadir stock" min="1">
            <button class="btn-add-stock" data-id="${doc.id}">Reañadir Stock</button>
        `;

        productsList.appendChild(card);
    });

    // Añadir event listeners para los botones de eliminar, editar, descontar y reañadir stock
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', deleteProduct);
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', editProduct);
    });

    document.querySelectorAll('.btn-descuento').forEach(button => {
        button.addEventListener('click', discountStock);
    });

    document.querySelectorAll('.btn-add-stock').forEach(button => {
        button.addEventListener('click', reAddStock);
    });
}

// Función para editar un producto
async function editProduct(e) {
    const productId = e.target.dataset.id;

    try {
        const productRef = db.collection('productos').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            Swal.fire({
                title: 'Error',
                text: 'Producto no encontrado',
                icon: 'error'
            });
            return;
        }

        const product = productDoc.data();

        const { value: formValues } = await Swal.fire({
            title: 'Editar producto',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${product.name}">` +
                `<input id="swal-input2" type="number" class="swal2-input" placeholder="Precio" value="${product.price}">` +
                `<input id="swal-input3" type="number" class="swal2-input" placeholder="Stock" value="${product.stock}">`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ];
            }
        });

        if (formValues) {
            const [newName, newPrice, newStock] = formValues;

            // Actualiza el producto en Firebase
            await productRef.update({
                name: newName,
                price: newPrice,
                stock: parseInt(newStock)
            });

            Swal.fire({
                title: 'Éxito',
                text: 'Producto actualizado correctamente',
                icon: 'success'
            });
            loadProducts();
        }
    } catch (error) {
        console.error("Error al actualizar producto: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al actualizar el producto',
            icon: 'error'
        });
    }
}

// Función para eliminar un producto
async function deleteProduct(e) {
    const productId = e.target.dataset.id;

    try {
        await db.collection('productos').doc(productId).delete();
        Swal.fire({
            title: 'Éxito',
            text: 'Producto eliminado correctamente',
            icon: 'success'
        });
        loadProducts();
    } catch (error) {
        console.error("Error al eliminar producto: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al eliminar el producto',
            icon: 'error'
        });
    }
}

// Función para descontar el stock de un producto
async function discountStock(e) {
    const productId = e.target.dataset.id;
    const cantidadInput = document.getElementById(`cantidad-${productId}`);

    if (!cantidadInput) {
        Swal.fire({
            title: 'Error',
            text: 'No se encontró el campo de cantidad',
            icon: 'error'
        });
        return;
    }

    const cantidad = parseInt(cantidadInput.value);

    if (!cantidad || cantidad <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Introduce una cantidad válida para descontar',
            icon: 'error'
        });
        return;
    }

    try {
        const productRef = db.collection('productos').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            Swal.fire({
                title: 'Error',
                text: 'Producto no encontrado',
                icon: 'error'
            });
            return;
        }

        const product = productDoc.data();
        const currentStock = product.stock;

        if (cantidad > currentStock) {
            Swal.fire({
                title: 'Error',
                text: 'No hay suficiente stock para descontar',
                icon: 'error'
            });
            return;
        }

        const newStock = currentStock - cantidad;

        await productRef.update({
            stock: newStock
        });

        Swal.fire({
            title: 'Éxito',
            text: `Se ha descontado ${cantidad} unidades del producto ${product.name}. Nuevo stock: ${newStock}`,
            icon: 'success'
        });

        loadProducts();
    } catch (error) {
        console.error("Error al descontar stock: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al descontar el stock',
            icon: 'error'
        });
    }
}

// Función para reañadir stock
async function reAddStock(e) {
    const productId = e.target.dataset.id;
    const addStockInput = document.getElementById(`cantidad-add-${productId}`);
    const cantidadToAdd = parseInt(addStockInput.value);

    if (!cantidadToAdd || cantidadToAdd <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Introduce una cantidad válida para reañadir stock',
            icon: 'error'
        });
        return;
    }

    try {
        const productRef = db.collection('productos').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            Swal.fire({
                title: 'Error',
                text: 'Producto no encontrado',
                icon: 'error'
            });
            return;
        }

        const product = productDoc.data();
        const currentStock = product.stock;
        const newStock = currentStock + cantidadToAdd;

        await productRef.update({
            stock: newStock
        });

        Swal.fire({
            title: 'Éxito',
            text: `Se han añadido ${cantidadToAdd} unidades al producto ${product.name}. Nuevo stock: ${newStock}`,
            icon: 'success'
        });

        loadProducts();
    } catch (error) {
        console.error("Error al añadir stock: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Error al añadir stock al producto',
            icon: 'error'
        });
    }
}

// Verifica si el usuario está autenticado al cargar la página
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html"; // Redirige si el usuario no está autenticado
    } else {
        console.log("Bienvenido", user.email);
    }
});

function goBack() {
    window.history.back();
}
