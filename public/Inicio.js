// Configuración de Firebase
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

// Referencia a los elementos
const welcomeMessage = document.querySelector('.welcome');
const logoutButton = document.getElementById('btnLogout');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.sidebar');


// Cerrar sesión
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        // Redirigir al usuario a la página de login después de cerrar sesión
        window.location.href = 'index.html';  // Cambia a tu página de login
    }).catch((error) => {
        console.error('Error al cerrar sesión', error);
    });
});

// Toggle del sidebar al hacer clic en el menú hamburguesa
hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    hamburgerMenu.classList.toggle('open');
});

// Cerrar el sidebar al hacer clic fuera de él
document.addEventListener('click', (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickInsideHamburger = hamburgerMenu.contains(event.target);

    // Si el clic no fue dentro del sidebar ni del botón del menú, cierra el sidebar
    if (!isClickInsideSidebar && !isClickInsideHamburger) {
        sidebar.classList.remove('open');
        hamburgerMenu.classList.remove('open');
    }
});

firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        // Si el usuario no está autenticado, redirige a la página de inicio de sesión
        window.location.href = "index.html";
    } else {
        // El usuario está autenticado, muestra el contenido de la página principal
        console.log("Bienvenido", user.email);
    }
});
