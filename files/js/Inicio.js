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
// Seleccionamos el botón de salir
const logoutButton = document.getElementById('btnLogout');

// Añadimos el evento para cerrar sesión
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        // Redirigir al usuario a la página de login después de cerrar sesión
        window.location.href = 'index.html';  // Cambia 'login.html' a la ruta correcta de tu página de login
    }).catch((error) => {
        console.error('Error al cerrar sesión', error);
    });
});
