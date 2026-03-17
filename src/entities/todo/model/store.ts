import { create } from 'zustand'
import {
  createTodo,
  deleteOpenTodos,
  deleteTodo,
  subscribeTodos,
  updateTodoDone,
} from '../api/todos'

export type Todo = {
  id: string
  title: string
  done: boolean
}

export type TodoFilter = 'all' | 'active' | 'done'

type TodoStore = {
  todos: Todo[]
  draft: string
  filter: TodoFilter
  userId: string | null
  isLoading: boolean
  hasLoaded: boolean
  setDraft: (draft: string) => void
  setFilter: (filter: TodoFilter) => void
  setUserId: (userId: string | null) => void
  resetTodos: () => void
  startTodosSubscription: (userId: string) => () => void
  addTodo: () => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  removeTodo: (id: string) => Promise<void>
  clearOpenTodos: () => Promise<void>
}

export const getVisibleTodos = (todos: Todo[], filter: TodoFilter) => {
  if (filter === 'active') {
    return todos.filter((todo) => !todo.done)
  }

  if (filter === 'done') {
    return todos.filter((todo) => todo.done)
  }

  return todos
}

export const getOpenCount = (todos: Todo[]) =>
  todos.filter((todo) => !todo.done).length

export const getFilterLabel = (filter: TodoFilter) => {
  if (filter === 'active') {
    return 'Active only'
  }

  if (filter === 'done') {
    return 'Completed'
  }

  return 'All tasks'
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  draft: '',
  filter: 'all',
  userId: null,
  isLoading: true,
  hasLoaded: false,
  setDraft: (draft) => set({ draft }),
  setFilter: (filter) => set({ filter }),
  setUserId: (userId) => set({ userId }),
  resetTodos: () =>
    set({
      todos: [],
      draft: '',
      filter: 'all',
      userId: null,
      isLoading: false,
      hasLoaded: false,
    }),
  startTodosSubscription: (userId) => {
    set({ isLoading: true, userId })

    set({ isLoading: true })

    return subscribeTodos(userId, (todos) => {
      set({
        todos,
        isLoading: false,
        hasLoaded: true,
      })
    })
  },
  addTodo: async () => {
    const userId = get().userId
    const title = get().draft.trim()
    if (!title || !userId) {
      return
    }

    await createTodo(userId, title)
    set({ draft: '' })
  },
  toggleTodo: async (id) => {
    const userId = get().userId
    const todo = get().todos.find((currentTodo) => currentTodo.id === id)
    if (!todo || !userId) {
      return
    }

    await updateTodoDone(userId, id, !todo.done)
  },
  removeTodo: async (id) => {
    const userId = get().userId
    if (!userId) {
      return
    }

    await deleteTodo(userId, id)
  },
  clearOpenTodos: async () => {
    const userId = get().userId
    if (!userId) {
      return
    }

    await deleteOpenTodos(userId, get().todos)
  },
}))
