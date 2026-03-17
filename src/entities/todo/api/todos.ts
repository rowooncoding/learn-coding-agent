import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../shared/config/firebase'
import type { Todo } from '../model/store'

type FirestoreTodo = {
  title: string
  done: boolean
  createdAt: number
}

const todosCollection = collection(db, 'todos')
const todosQuery = query(todosCollection, orderBy('createdAt', 'desc'))

export const subscribeTodos = (onChange: (todos: Todo[]) => void) =>
  onSnapshot(todosQuery, (snapshot) => {
    const todos = snapshot.docs.map((todoDoc) => {
      const data = todoDoc.data() as FirestoreTodo

      return {
        id: todoDoc.id,
        title: data.title,
        done: data.done,
      }
    })

    onChange(todos)
  })

export const createTodo = async (title: string) => {
  await addDoc(todosCollection, {
    title,
    done: false,
    createdAt: Date.now(),
  })
}

export const updateTodoDone = async (id: string, done: boolean) => {
  await updateDoc(doc(db, 'todos', id), { done })
}

export const deleteTodo = async (id: string) => {
  await deleteDoc(doc(db, 'todos', id))
}

export const deleteOpenTodos = async (todos: Todo[]) => {
  const batch = writeBatch(db)

  todos
    .filter((todo) => !todo.done)
    .forEach((todo) => batch.delete(doc(db, 'todos', todo.id)))

  await batch.commit()
}
