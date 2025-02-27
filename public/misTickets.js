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

    // Elementos del DOM
    const filtroMes = document.getElementById("filtro-mes");
    const ticketsList = document.getElementById("tickets-list");

    // Variable para almacenar el ID del usuario actual
    let currentUserId = null;

    // Esperar a que se establezca la sesión del usuario
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
            cargarTickets();
        } else {
            ticketsList.innerHTML = "<h3>No hay usuario autenticado</h3>";
        }
    });

    // Función para cargar los tickets
    function cargarTickets() {
        ticketsList.innerHTML = "<h3>Cargando tickets...</h3>";

        // Comenzar la consulta filtrando por el usuario actual
        let query = db.collection("tickets")
                      .where("userId", "==", currentUserId)
                      .orderBy("fecha", "desc");

        // Filtrar por mes si se selecciona uno
        if (filtroMes.value) {
            let mes = filtroMes.value; // Valor: "01", "02", etc.
            let año = new Date().getFullYear(); // Suponemos que los tickets son del año actual

            let fechaInicio = `${año}-${mes}-01`;
            let fechaFin;

            if (mes === "12") {
                fechaFin = `${parseInt(año) + 1}-01-01`;
            } else {
                fechaFin = `${año}-${(parseInt(mes) + 1).toString().padStart(2, '0')}-01`;
            }

            console.log("Filtrando desde:", fechaInicio, "hasta:", fechaFin);

            query = query.where("fecha", ">=", fechaInicio)
                         .where("fecha", "<", fechaFin);
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

                // Botón Ver Ticket con SweetAlert2
                const verBtn = document.createElement("button");
                verBtn.innerText = "Ver Ticket";
                verBtn.classList.add("btn-view");
                verBtn.onclick = () => mostrarTicket(ticket);

                // Botón Descargar PDF
                const descargarBtn = document.createElement("button");
                descargarBtn.innerText = "Descargar PDF";
                descargarBtn.classList.add("btn-download");
                descargarBtn.onclick = () => descargarTicket(doc.id, ticket);

                actionsDiv.appendChild(verBtn);
                actionsDiv.appendChild(descargarBtn);

                ticketDiv.appendChild(infoDiv);
                ticketDiv.appendChild(actionsDiv);

                ticketsList.appendChild(ticketDiv);
            });
        }).catch(error => {
            console.error("Error al cargar tickets:", error);
        });
    }

    // Evento para recargar tickets al cambiar el filtro
    filtroMes.addEventListener("change", cargarTickets);

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

    // Función para descargar el ticket en PDF con formato de ticket
function descargarTicket(id, venta) {
    const { jsPDF } = window.jspdf;
    // Creamos un PDF en formato ticket: 80mm de ancho y altura inicial de 200mm (se ajusta según contenido)
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [80, 200]
    });
  
    const marginLeft = 5;
    const centerX = 40; // centro de 80mm
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
      // Nombre del producto en negrita
      doc.setFont("helvetica", "bold");
      doc.text(item.name, marginLeft, currentY);
      currentY += 4;
  
      // Detalles: cantidad, precio y subtotal
      doc.setFont("helvetica", "normal");
      let detalles = `Qty: ${item.cantidad}  Sub: ${item.subtotal}`;
      if (item.observaciones) {
        detalles += `  Obs: ${item.observaciones}`;
      }
      doc.text(detalles, marginLeft, currentY);
      currentY += 5;
  
      // Espacio extra entre productos
      currentY += 2;
    });
  
    // Línea final
    doc.line(marginLeft, currentY, 80 - marginLeft, currentY);
    currentY += 5;
  
    // Mensaje final centrado
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("¡Gracias por su compra!", centerX, currentY, { align: "center" });
  
    // Guardar el archivo PDF
    doc.save(`ticket_${id}.pdf`);
  }
  
});

function goBack() {
    window.history.back();
}
