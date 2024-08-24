import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDGmJasW6RmA7ZieS-quBplwKLlIFR2XE8",
    authDomain: "yulss2-7a96c.firebaseapp.com",
    projectId: "yulss2-7a96c",
    storageBucket: "yulss2-7a96c.appspot.com",
    messagingSenderId: "844701001256",
    appId: "1:844701001256:web:b7a1352be1e951ee70371d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Auth con persistencia en AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
export const db = getFirestore(app);
