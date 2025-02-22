import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.addEventListener("DOMContentLoaded", async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const role = userDoc.data().role;

                if (role === "trabajador") {
                    // 🔹 Oculta elementos de admin en la página de trabajador
                    document.getElementById("adminPanel").style.display = "none";
                }
            }
        } else {
            // 🔹 Si no hay usuario autenticado, redirigir al login
            window.location.href = "login.html";
        }
    });
});
