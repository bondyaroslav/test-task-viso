import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import firebase from "firebase/compat/app"
import "firebase/compat/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyDwls1vON_HIaKb3CqEgA3DSyI-EZAYuUg",
    authDomain: "test-task-viso-1dadb.firebaseapp.com",
    projectId: "test-task-viso-1dadb",
    storageBucket: "test-task-viso-1dadb.appspot.com",
    messagingSenderId: "394668604502",
    appId: "1:394668604502:web:4702d956649d2b4b5e0ff7",
    measurementId: "G-RVR49E30MV"
}

firebase.initializeApp(firebaseConfig)
export const db = firebase.firestore()

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
