// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfWZC0a-wDY4n-M7uCevCm3pVBgyO5gBE",
  authDomain: "inventario-tienda-f0381.firebaseapp.com",
  projectId: "inventario-tienda-f0381",
  storageBucket: "inventario-tienda-f0381.firebasestorage.app",
  messagingSenderId: "528798738083",
  appId: "1:528798738083:web:33469816576ea884ea8116"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar base de datos Firestore
export const db = getFirestore(app);
