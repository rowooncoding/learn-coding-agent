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
import { FirebaseError } from 'firebase/app'
import { db } from '../../../shared/config/firebase'
import type { Todo } from '../model/store'

type FirestoreTodo = {
  title: string
  done: boolean
  createdAt: number
}

const FIRESTORE_TIMEOUT_MS = 10000

const getTodosCollection = (userId: string) =>
  collection(db, 'users', userId, 'todos')

const mapFirestoreError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return new Error(
        'Firestore 권한이 없습니다. Firebase Console의 Firestore Rules에서 현재 로그인한 사용자에게 users/{uid}/todos 쓰기 권한을 열어주세요.',
      )
    }

    if (error.code === 'unauthenticated') {
      return new Error('로그인 인증이 만료되었습니다. 다시 로그인해 주세요.')
    }
  }

  return error
}

const withFirestoreTimeout = async <T>(promise: Promise<T>) =>
  Promise.race<T>([
    promise.catch((error) => {
      throw mapFirestoreError(error)
    }),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            'Firestore 요청이 시간 안에 완료되지 않았습니다. 보안 규칙이나 네트워크 상태를 확인해 주세요.',
          ),
        )
      }, FIRESTORE_TIMEOUT_MS)
    }),
  ])

export const subscribeTodos = (
  userId: string,
  onChange: (todos: Todo[]) => void,
) =>
  onSnapshot(query(getTodosCollection(userId), orderBy('createdAt', 'desc')), (snapshot) => {
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

export const createTodo = async (userId: string, title: string) => {
  await withFirestoreTimeout(
    addDoc(getTodosCollection(userId), {
      title,
      done: false,
      createdAt: Date.now(),
    }),
  )
}

export const updateTodoDone = async (userId: string, id: string, done: boolean) => {
  await withFirestoreTimeout(
    updateDoc(doc(db, 'users', userId, 'todos', id), { done }),
  )
}

export const deleteTodo = async (userId: string, id: string) => {
  await withFirestoreTimeout(deleteDoc(doc(db, 'users', userId, 'todos', id)))
}

export const deleteOpenTodos = async (userId: string, todos: Todo[]) => {
  const openTodos = todos.filter((todo) => !todo.done)

  if (openTodos.length === 0) {
    return
  }

  const batch = writeBatch(db)

  openTodos.forEach((todo) =>
    batch.delete(doc(db, 'users', userId, 'todos', todo.id)),
  )

  await withFirestoreTimeout(batch.commit())
}
