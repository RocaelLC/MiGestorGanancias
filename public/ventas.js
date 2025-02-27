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
    // Variable global para almacenar el ID del usuario autenticado
    let currentUserId = null;

    // Funciones para guardar y cargar el carrito en localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(carrito));
    }

    function loadCart() {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            carrito.length = 0; // Vacía el carrito actual
            carrito.push(...parsedCart);
            actualizarContadorCarrito();
            actualizarCarrito();
        }
    }

    // Cargar el carrito desde localStorage al iniciar la aplicación
    loadCart();

    // Verifica si el usuario está autenticado
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
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

    // Función para generar el ticket en PDF (formato ticket)
    function generarTicket(venta) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [80, 200]
        });

        const marginLeft = 5;
        const centerX = 40;
        let currentY = 5;

        // Título centrado
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Ticket de Venta", centerX, currentY, { align: "center" });
        currentY += 10;

        // Línea separadora
        doc.setLineWidth(0.5);
        doc.line(marginLeft, currentY, 80 - marginLeft, currentY);
        currentY += 5;

        // Fecha y total
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Fecha: ${venta.fecha}`, marginLeft, currentY);
        currentY += 5;
        doc.text(`Total: ${venta.total} pesos`, marginLeft, currentY);
        currentY += 7;

        // Línea separadora
        doc.line(marginLeft, currentY, 80 - marginLeft, currentY);
        currentY += 5;

        // Listado de productos
        venta.items.forEach(item => {
          doc.setFont("helvetica", "bold");
          doc.text(item.name, marginLeft, currentY);
          currentY += 4;

          doc.setFont("helvetica", "normal");
          const detalles = `cantidad: ${item.cantidad}  Precio: ${item.price}  Subtotal: ${item.subtotal}`;
          doc.text(detalles, marginLeft, currentY);
          currentY += 5;

          if (item.observaciones) {
            doc.setFontSize(8);
            doc.text(`Observaciones: ${item.observaciones}`, marginLeft, currentY);
            currentY += 5;
            doc.setFontSize(10);
          }
          
          currentY += 2;
        });

        // Línea final
        doc.line(marginLeft, currentY, 80 - marginLeft, currentY);
        currentY += 5;

        // Mensaje final centrado
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text("¡Gracias por su compra!", centerX, currentY, { align: "center" });

        doc.save("ticket.pdf");
    }

    // Función para mostrar productos en la pantalla
    function mostrarProductos() {
        const contenedor = document.getElementById("product-list");
        contenedor.innerHTML = "";

        productos.forEach(producto => {
            const card = document.createElement("div");
            card.classList.add("product-card");

            card.innerHTML = `
                <img src="${producto.image}" alt="${producto.name}" onclick="mostrarDetalleProducto('${producto.id}')" style="cursor:pointer;">
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

    // Función para agregar productos al carrito desde la tarjeta
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
        // Se usa el precio original y sin observaciones al agregar desde la tarjeta
        agregarAlCarritoDesdeModal(producto, cantidad, "", producto.price);
        document.getElementById(`cantidad-${id}`).innerText = "0";
    };

    // Función para agregar al carrito desde el modal (con precio modificado y observaciones)
    function agregarAlCarritoDesdeModal(producto, cantidad, observaciones, nuevoPrecio) {
        let itemCarrito = carrito.find(item => item.id === producto.id);
        if (itemCarrito) {
            itemCarrito.cantidad += cantidad;
            itemCarrito.modifiedPrice = nuevoPrecio;
            if (observaciones) {
                itemCarrito.observaciones = observaciones;
            }
        } else {
            carrito.push({
                ...producto,
                cantidad: cantidad,
                modifiedPrice: nuevoPrecio,
                observaciones: observaciones || ""
            });
        }
        actualizarContadorCarrito();
        actualizarCarrito();
        saveCart();
    }

    // Función para mostrar el detalle del producto en un modal SweetAlert
    window.mostrarDetalleProducto = function (id) {
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        Swal.fire({
            title: producto.name,
            width: '480px',
            html: `
                <img src="${producto.image}" alt="${producto.name}" style="max-width:50%; margin-bottom:10px;">
                <p>Stock: ${producto.stock}</p>
                <p>Precio: <input id="swal-input-price" class="swal2-input" type="number" value="${producto.price}" min="0"></p>
                <p>Cantidad: <input id="swal-input-quantity" class="swal2-input" type="number" value="1" min="1" max="${producto.stock}"></p>
                <p>Observaciones: <textarea id="swal-input-obs" class="swal2-textarea" placeholder="Agrega observaciones..."></textarea></p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Agregar al carrito',
            preConfirm: () => {
                const precio = parseFloat(document.getElementById('swal-input-price').value);
                const cantidad = parseInt(document.getElementById('swal-input-quantity').value);
                const obs = document.getElementById('swal-input-obs').value;
                if (isNaN(precio) || precio < 0 || isNaN(cantidad) || cantidad < 1) {
                    Swal.showValidationMessage('Por favor ingresa un precio válido y cantidad');
                    return false;
                }
                if (cantidad > producto.stock) {
                    Swal.showValidationMessage('La cantidad supera el stock disponible');
                    return false;
                }
                return { precio, cantidad, obs };
            }
        }).then(result => {
            if (result.isConfirmed) {
                const { precio, cantidad, obs } = result.value;
                agregarAlCarritoDesdeModal(producto, cantidad, obs, precio);
                Swal.fire('Agregado', 'El producto ha sido agregado al carrito', 'success');
            }
        });
    };

    // Función para actualizar el contador del carrito
    function actualizarContadorCarrito() {
        const cartCount = document.getElementById("cart-count");
        cartCount.innerText = carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    // Función para actualizar el carrito visualmente
    function actualizarCarrito() {
        const cartItems = document.getElementById("cart-items");
        if (!cartItems) return;
        cartItems.innerHTML = "";
        if (carrito.length === 0) {
            cartItems.innerHTML = "<p>El carrito está vacío</p>";
            return;
        }
        carrito.forEach((item, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <span>${item.name}</span>
                    <span>Cantidad: ${item.cantidad}</span>
                    <span>Precio: ${item.modifiedPrice ? item.modifiedPrice : item.price} pesos</span>
                    ${ item.observaciones ? `<span>Obs: ${item.observaciones}</span>` : '' }
                </div>
                <button>Eliminar</button>
            `;
            cartItem.querySelector("button").addEventListener("click", () => {
                eliminarDelCarrito(index);
            });
            cartItems.appendChild(cartItem);
        });
    }

    // Función para eliminar productos del carrito
    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        actualizarContadorCarrito();
        actualizarCarrito();
        saveCart();
    }

    // Funcionalidad de búsqueda
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("input", function () {
        const searchTerm = searchBar.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => producto.name.toLowerCase().includes(searchTerm));
        mostrarProductosFiltrados(productosFiltrados);
    });

    // Función para mostrar productos filtrados
    function mostrarProductosFiltrados(productosFiltrados) {
        const contenedor = document.getElementById("product-list");
        contenedor.innerHTML = "";
        productosFiltrados.forEach(producto => {
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.innerHTML = `
                <img src="${producto.image}" alt="${producto.name}" onclick="mostrarDetalleProducto('${producto.id}')" style="cursor:pointer;">
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
        finalizarVentaBtn.addEventListener("click", async () => {
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
                total: carrito.reduce((acc, item) => {
                    const precio = item.modifiedPrice ? item.modifiedPrice : item.price;
                    return acc + precio * item.cantidad;
                }, 0),
                items: carrito.map(item => {
                    const precio = item.modifiedPrice ? item.modifiedPrice : item.price;
                    return {
                        id: item.id,
                        name: item.name,
                        cantidad: item.cantidad,
                        price: precio,
                        subtotal: precio * item.cantidad,
                        observaciones: item.observaciones || ""
                    };
                }),
                userId: currentUserId
            };

            try {
                await db.collection("ventas").add(venta);
                const batch = db.batch();
                for (const item of carrito) {
                    const productoRef = db.collection("productos").doc(item.id);
                    const productoDoc = await productoRef.get();
                    if (productoDoc.exists) {
                        const nuevoStock = productoDoc.data().stock - item.cantidad;
                        batch.update(productoRef, { stock: nuevoStock });
                    }
                }
                await batch.commit();
                await db.collection("tickets").add(venta);
                Swal.fire('Éxito', 'Venta finalizada con éxito.', 'success');
                generarTicket(venta);
                carrito.length = 0;
                actualizarContadorCarrito();
                actualizarCarrito();
                saveCart();
                finalizarVentaBtn.disabled = false;
            } catch (error) {
                Swal.fire('Error', 'Hubo un problema al procesar la venta.', 'error');
                console.error("Error al finalizar la venta:", error);
                finalizarVentaBtn.disabled = false;
            }
        });
    }

    // Manejo del carrito emergente
    const cartIcon = document.getElementById('cart-icon');
    const cartPopup = document.getElementById('cart-popup');
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartPopup.style.display = (cartPopup.style.display === 'block') ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
        if (!cartIcon.contains(e.target) && !cartPopup.contains(e.target)) {
            cartPopup.style.display = 'none';
        }
    });
});

function goBack() {
    window.history.back();
}
