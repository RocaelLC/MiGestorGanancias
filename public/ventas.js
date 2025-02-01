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
//actualizar carrito
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

// Función para generar ticket y mostrarlo en la interfaz
function generarTicket(venta) {
    let ticketHTML = `<h3>TICKET DE VENTA</h3>`;
    ticketHTML += `<p>Fecha: ${new Date(venta.fecha).toLocaleString()}</p>`;
    ticketHTML += `<table border='1'><tr><th>Producto</th><th>Cantidad</th><th>Subtotal</th></tr>`;
    venta.items.forEach(item => {
        ticketHTML += `<tr><td>${item.name}</td><td>${item.cantidad}</td><td>${item.subtotal} pesos</td></tr>`;
    });
    ticketHTML += `</table><p><strong>Total: ${venta.total} pesos</strong></p>`;
    
    document.getElementById("ticket-container").innerHTML = ticketHTML;
}

// Función para finalizar la venta y guardar en Firebase
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
            fecha: new Date().toISOString(), // Guardar la fecha y hora
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
            generarTicket(venta); // Muestra el botón "Ver Ticket"
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

// Función para generar y mostrar el botón "Ver Ticket"
function generarTicket(venta) {
    const ticketContainer = document.getElementById("ticket-container");
    ticketContainer.innerHTML = ""; // Limpiar el contenedor

    // Crear el botón "Ver Ticket"
    const botonVer = document.createElement("button");
    botonVer.innerText = "Ver Ticket";
    botonVer.classList.add("ticket-button");
    botonVer.onclick = () => generarPDF(venta); // Asigna la función para generar PDF

    ticketContainer.appendChild(botonVer);
}

// Función para generar el PDF del ticket
function generarPDF(venta) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Fecha y hora de la venta
    const fechaVenta = new Date(venta.fecha);
    const fechaTexto = fechaVenta.toLocaleDateString();
    const horaTexto = fechaVenta.toLocaleTimeString();

    doc.setFont("helvetica", "bold");
    doc.text("TICKET DE VENTA", 80, 10);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${fechaTexto}`, 10, 20);
    doc.text(`Hora: ${horaTexto}`, 10, 30);
    
    doc.text("Productos:", 10, 40);
    
    let y = 50; // Posición inicial
    venta.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} - Cantidad: ${item.cantidad} - Subtotal: $${item.subtotal}`, 10, y);
        y += 10;
    });

    doc.text(`Total: $${venta.total}`, 10, y + 10);

    // Guardar y mostrar el PDF
    doc.save(`Ticket_Venta_${fechaTexto}.pdf`);
}