document.addEventListener("DOMContentLoaded", function () {
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
   // Función para generar un ticket en PDF con un diseño mejorado
function generarTicket(venta) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título y formato
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Ticket de Venta", 10, 10);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Fecha y total
    doc.text(`Fecha: ${venta.fecha}`, 10, 20);
    doc.text(`Total: ${venta.total} pesos`, 10, 30);

    // Estilos para los productos
    let y = 40;
    venta.items.forEach(item => {
        doc.setFont("helvetica", "normal");
        doc.text(`${item.name}`, 10, y);
        doc.setFont("helvetica", "italic");
        doc.text(`Cantidad: ${item.cantidad} | Subtotal: ${item.subtotal} pesos`, 60, y);
        y += 10;
    });

    // Línea de separación
    doc.setLineWidth(0.5);
    doc.line(10, y + 5, 200, y + 5); // Línea horizontal

    // Pie de página
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Gracias por tu compra. ¡Vuelve pronto!", 10, y + 15);

    // Guardar el archivo
    doc.save("ticket.pdf");
}


    // Función para mostrar productos en la pantalla
    function mostrarProductos() {
        const contenedor = document.getElementById("product-list");
        contenedor.innerHTML = ""; // Limpiar el contenedor

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
    window.modificarCantidad = function (id, cambio) {
        let cantidadSpan = document.getElementById(`cantidad-${id}`);
        let cantidad = parseInt(cantidadSpan.innerText);

        if (cantidad + cambio >= 0) {
            cantidadSpan.innerText = cantidad + cambio;
        }
    };

    // Función para agregar productos al carrito
    window.agregarAlCarrito = function (id) {
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

        // Buscar si el producto ya está en el carrito
        let itemCarrito = carrito.find(p => p.id === id);
        if (itemCarrito) {
            // Si ya está en el carrito, solo actualizamos la cantidad
            itemCarrito.cantidad += cantidad;
        } else {
            // Si no está en el carrito, lo añadimos
            carrito.push({ ...producto, cantidad });
        }

        // Actualizar el contador del carrito
        actualizarContadorCarrito();

        // Actualizar el carrito visualmente
        actualizarCarrito();

        // Resetear la cantidad a 0
        document.getElementById(`cantidad-${id}`).innerText = "0";
    };

    // Función para actualizar el contador del carrito
    function actualizarContadorCarrito() {
        const cartCount = document.getElementById("cart-count");
        cartCount.innerText = carrito.reduce((total, item) => total + item.cantidad, 0);  // Sumar todas las cantidades
    }

    // Función para actualizar el carrito visualmente
    function actualizarCarrito() {
        const cartItems = document.getElementById("cart-items");
        if (!cartItems) return;

        cartItems.innerHTML = ""; // Limpiar el contenedor antes de mostrar los productos del carrito

        if (carrito.length === 0) {
            cartItems.innerHTML = "<p>El carrito está vacío</p>";
            return;
        }

        carrito.forEach((item, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");

            // Cambio a una función anónima que pasa el índice
            cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <span>${item.name}</span>
                <span>Cantidad: ${item.cantidad}</span>
                <span>Precio: ${item.price * item.cantidad} pesos</span>
            </div>
            <button>Eliminar</button>
            `;
            cartItem.querySelector("button").addEventListener("click", () => eliminarDelCarrito(index)); // Asignación del evento click 

            cartItems.appendChild(cartItem);
        });
    }

    // Función para eliminar productos del carrito
    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        actualizarContadorCarrito();  // Actualizar el contador
        actualizarCarrito();  // Actualizar la vista del carrito
    }

    // Agregar la funcionalidad de búsqueda
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("input", function () {
        const searchTerm = searchBar.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => producto.name.toLowerCase().includes(searchTerm));
        mostrarProductosFiltrados(productosFiltrados);
    });

    // Función para mostrar los productos filtrados
    function mostrarProductosFiltrados(productosFiltrados) {
        const contenedor = document.getElementById("product-list");
        contenedor.innerHTML = ""; // Limpiar el contenedor

        productosFiltrados.forEach(producto => {
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

   // Función para finalizar la venta y guardar en Firebase
   const finalizarVentaBtn = document.getElementById("finalize-sale");
   if (finalizarVentaBtn) {
       finalizarVentaBtn.addEventListener("click", () => {
           if (carrito.length === 0) {
               Swal.fire('Error', 'El carrito está vacío.', 'error');
               return;
           }

           finalizarVentaBtn.disabled = true;
           Swal.fire({
               title: 'Procesando...',
               allowOutsideClick: false,
               didOpen: () => {
                   Swal.showLoading();
               }
           });

           const venta = {
               fecha: new Date().toISOString(),
               total: carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0),
               items: carrito.map(item => ({
                   id: item.id,
                   name: item.name,
                   cantidad: item.cantidad,
                   subtotal: item.price * item.cantidad
               }))
           };

           db.collection("ventas").add(venta).then(() => {
               db.collection("tickets").add(venta).then(() => {
                   Swal.fire('Éxito', 'Venta finalizada con éxito.', 'success');
                   generarTicket(venta);
                   carrito.length = 0;
                   actualizarContadorCarrito();
                   actualizarCarrito();
                   finalizarVentaBtn.disabled = false;
               });
           }).catch(error => {
               Swal.fire('Error', 'Hubo un problema al procesar la venta.', 'error');
               console.error("Error al finalizar la venta:", error);
               finalizarVentaBtn.disabled = false;
           });
       });
   }

});

// Obtén los elementos necesarios
const cartIcon = document.getElementById('cart-icon');
const cartPopup = document.getElementById('cart-popup');

// Manejador de clic para mostrar/ocultar el carrito
cartIcon.addEventListener('click', (e) => {
    // Evitar que el clic en el ícono cierre el carrito inmediatamente
    e.stopPropagation();
    // Alternar la visibilidad del carrito emergente
    if (cartPopup.style.display === 'block') {
        cartPopup.style.display = 'none';
    } else {
        cartPopup.style.display = 'block';
    }
});

// Cerrar el carrito si se hace clic fuera del carrito o el ícono
document.addEventListener('click', (e) => {
    if (!cartIcon.contains(e.target) && !cartPopup.contains(e.target)) {
        cartPopup.style.display = 'none';
    }
});
function goBack() {
    window.history.back();
}
