import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ9YBemjnEsJM-8Pn-3krF6i4Rs6koTeU',
  authDomain: 'todo-list-93583.firebaseapp.com',
  projectId: 'todo-list-93583',
  storageBucket: 'todo-list-93583.firebasestorage.app',
  messagingSenderId: '632673528594',
  appId: '1:632673528594:web:373e1f849078b46809e1cb',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
