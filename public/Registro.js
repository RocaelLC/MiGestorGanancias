// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB0g3hI2fFBf8dD5rYkt00IY6iyKf0HoUU",
    authDomain: "migestor-fc269.firebaseapp.com",
    projectId: "migestor-fc269",
    storageBucket: "migestor-fc269.appspot.com",
    messagingSenderId: "901999644556",
    appId: "1:901999644556:web:d39a8aebd3a22069ca10a9"
};

// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Obtener referencia al formulario
const registerForm = document.getElementById('registerForm');

// Añadir evento de submit al formulario
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores de los campos
    const email = document.getElementById('emailRegister').value;
    const password = document.getElementById('passwordRegister').value;
    const name = document.getElementById('name').value;
    const apellido = document.getElementById('apellido').value;
    const userName = document.getElementById('user').value;

    try {
        // Crear usuario con Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Actualizar perfil del usuario
        await updateProfile(user, {
            displayName: `${name} ${apellido}`
        });

        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            name: name,
            apellido: apellido,
            username: userName
        });

        
        // Redirigir a otra página
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error durante el registro:', error);
       
    }
});
