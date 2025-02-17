
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

    // Filtro de búsqueda por mes
    const filtroMes = document.getElementById("filtro-mes");

    // Cargar los tickets
    function cargarTickets() {
        const ticketsList = document.getElementById("tickets-list");
        ticketsList.innerHTML = "<h3>Cargando tickets...</h3>";

        const mesSeleccionado = filtroMes.value;

        let query = db.collection("tickets").orderBy("fecha", "desc"); // Ordenar por fecha descendente

        // Filtrar por mes
        if (mesSeleccionado) {
            query = query.where("fecha", ">=", new Date(`${mesSeleccionado}-01`))
                         .where("fecha", "<", new Date(`${parseInt(mesSeleccionado) + 1}-01`));
        }

        query.get().then(snapshot => {
            ticketsList.innerHTML = "";
            snapshot.forEach(doc => {
                const ticket = doc.data();
    
                // Crear contenedor de ticket
                const ticketDiv = document.createElement("div");
                ticketDiv.classList.add("ticket");
    
                // Contenedor de la información del ticket
                const infoDiv = document.createElement("div");
                infoDiv.classList.add("ticket-info");
                infoDiv.innerHTML = `
                    <p><strong>Fecha:</strong> ${formatFecha(ticket.fecha)}</p>
                    <p><strong>Total:</strong> ${ticket.total} pesos</p>
                `;
    
                // Contenedor de los botones
                const actionsDiv = document.createElement("div");
                actionsDiv.classList.add("ticket-actions");
    
                // Botón Ver Ticket con Swal
                const verBtn = document.createElement("button");
                verBtn.innerText = "Ver Ticket";
                verBtn.classList.add("btn-view");
                verBtn.onclick = () => mostrarTicket(ticket);
    
                // Botón Descargar PDF
                const descargarBtn = document.createElement("button");
                descargarBtn.innerText = "Descargar PDF";
                descargarBtn.classList.add("btn-download");
                descargarBtn.onclick = () => descargarTicket(doc.id, ticket);
    
                // Agregar botones al contenedor de acciones
                actionsDiv.appendChild(verBtn);
                actionsDiv.appendChild(descargarBtn);
    
                // Agregar info y botones al ticket
                ticketDiv.appendChild(infoDiv);
                ticketDiv.appendChild(actionsDiv);
    
                ticketsList.appendChild(ticketDiv);
            });
        }).catch(error => {
            console.error("Error al cargar tickets:", error);
        });
    }
    
    // Función para mostrar ticket en SweetAlert2
    function mostrarTicket(ticket) {
        let detalles = ticket.items.map(item => 
            `<p><strong>${item.name}</strong>: ${item.cantidad} x ${item.subtotal} pesos</p>`
        ).join("");
    
        Swal.fire({
            title: "Detalles del Ticket",
            html: `
                <p><strong>Fecha:</strong> ${formatFecha(ticket.fecha)}</p>
                <p><strong>Total:</strong> ${ticket.total} pesos</p>
                <hr>
                ${detalles}
            `,
            icon: "info",
            confirmButtonText: "Cerrar"
        });
    }
    
    // Función para dar formato a la fecha
    function formatFecha(fecha) {
        const dateObj = new Date(fecha);
        return dateObj.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
    }
    
    
    // Función para dar formato a la fecha
    function formatFecha(fecha) {
        const dateObj = new Date(fecha);
        return dateObj.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
    }
    function descargarTicket(id, venta) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Ticket de Venta", 10, 10);
        doc.text(`Fecha: ${venta.fecha}`, 10, 20);
        doc.text(`Total: ${venta.total} pesos`, 10, 30);

        let y = 40;
        venta.items.forEach(item => {
            doc.text(`${item.name} - Cantidad: ${item.cantidad} - Subtotal: ${item.subtotal} pesos`, 10, y);
            y += 10;
        });

        doc.save(`ticket_${id}.pdf`);
    }
// Agregar evento para filtrar por mes
filtroMes.addEventListener("change", cargarTickets);
    cargarTickets();
    
});
function goBack() {
    window.history.back();
}