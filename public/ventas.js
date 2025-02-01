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
const db = firebase.firestore();
const storage = firebase.storage();

let productos = [];
const carrito = [];

// Verifica si el usuario está autenticado
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        cargarProductos(user.uid);
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Debes iniciar sesión para ver tus productos',
            icon: 'error'
        });
    }
});

// Función para obtener productos de Firebase
function cargarProductos(uid) {
    db.collection("productos").where("userId", "==", uid).onSnapshot(snapshot => {
        productos = [];
        snapshot.forEach(doc => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        mostrarProductos();
    }, error => {
        console.error("Error al cargar productos:", error);
    });
}

// Función para mostrar productos en la pantalla
function mostrarProductos() {
    const contenedor = document.getElementById("product-list");
    contenedor.innerHTML = "";

    productos.forEach(producto => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
            <img src="${producto.image}" alt="${producto.name}">
            <h3>${producto.name}</h3>
            <p>Precio: ${producto.price} pesos</p>
            <p>Stock: <span id="stock-${producto.id}">${producto.stock}</span></p>
            <div class="quantity-container">
                <button onclick="modificarCantidad('${producto.id}', -1)">-</button>
                <span id="cantidad-${producto.id}">0</span>
                <button onclick="modificarCantidad('${producto.id}', 1)">+</button>
            </div>
            <button onclick="agregarAlCarrito('${producto.id}')">Agregar al carrito</button>
        `;

        contenedor.appendChild(card);
    });
}

// Función para modificar cantidad antes de agregar al carrito
function modificarCantidad(id, cambio) {
    let cantidadSpan = document.getElementById(`cantidad-${id}`);
    let cantidad = parseInt(cantidadSpan.innerText);

    if (cantidad + cambio >= 0) {
        cantidadSpan.innerText = cantidad + cambio;
    }
}

// Función para agregar productos al carrito
function agregarAlCarrito(id) {
    let cantidad = parseInt(document.getElementById(`cantidad-${id}`).innerText);
    if (cantidad === 0) {
        Swal.fire('Error', 'Debe agregar al menos un producto.', 'error');
        return;
    }

    let producto = productos.find(p => p.id === id);
    if (cantidad > producto.stock) {
        Swal.fire('Error', 'No hay suficiente stock.', 'error');
        return;
    }

    let itemCarrito = carrito.find(p => p.id === id);
    if (itemCarrito) {
        itemCarrito.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    }

    actualizarCarrito();
    document.getElementById(`cantidad-${id}`).innerText = "0";
}
function actualizarCarrito() {
    const tbody = document.getElementById("cart-items");
    tbody.innerHTML = "";
    let totalVenta = 0;

    carrito.forEach((item, index) => {
        let subtotal = item.price * item.cantidad;
        totalVenta += subtotal;
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.cantidad}</td>
            <td>${subtotal} pesos</td>
            <td><button onclick="eliminarDelCarrito(${index})">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });

    let trTotal = document.createElement("tr");
    trTotal.innerHTML = `
        <td colspan="2"><strong>Total</strong></td>
        <td colspan="2"><strong>${totalVenta} pesos</strong></td>
    `;
    tbody.appendChild(trTotal);
}

// Función para finalizar la venta y guardarla en Firestore
const finalizarVentaBtn = document.getElementById("finalize-sale");
if (finalizarVentaBtn) {
    finalizarVentaBtn.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire('Error', 'El carrito está vacío.', 'error');
            return;
        }

        const batch = db.batch();
        const ventaRef = db.collection("ventas").doc();
        const venta = {
            fecha: new Date(),
            total: carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0),
            items: carrito.map(item => ({
                id: item.id,
                name: item.name,
                cantidad: item.cantidad,
                subtotal: item.price * item.cantidad
            }))
        };

        batch.set(ventaRef, venta);

        carrito.forEach(item => {
            let productoRef = db.collection("productos").doc(item.id);
            batch.update(productoRef, { stock: firebase.firestore.FieldValue.increment(-item.cantidad) });
        });

        batch.commit().then(() => {
            carrito.length = 0;
            actualizarCarrito();
            Swal.fire('Éxito', 'Venta finalizada con éxito.', 'success');
        }).catch(error => {
            Swal.fire('Error', 'Hubo un problema al procesar la venta.', 'error');
            console.error("Error al finalizar la venta:", error);
        });
    });
}


// Función para eliminar productos del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

