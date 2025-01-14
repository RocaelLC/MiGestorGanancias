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

// Obtener referencia al formulario
const registerForm = document.getElementById('registerForm');

// Añadir evento de submit al formulario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtener valores de los campos
    const email = document.getElementById('emailRegister').value;
    const password = document.getElementById('passwordRegister').value;

    // Crear usuario con Firebase Authentication
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registro exitoso
            const user = userCredential.user;
            alert('Usuario registrado con éxito');
            // Redirigir o realizar otras acciones
        })
        .catch((error) => {
            // Manejo de errores
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});
