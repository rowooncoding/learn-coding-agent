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
  isLoading: boolean
  hasLoaded: boolean
  setDraft: (draft: string) => void
  setFilter: (filter: TodoFilter) => void
  startTodosSubscription: () => () => void
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
  isLoading: true,
  hasLoaded: false,
  setDraft: (draft) => set({ draft }),
  setFilter: (filter) => set({ filter }),
  startTodosSubscription: () => {
    set({ isLoading: true })

    return subscribeTodos((todos) => {
      set({
        todos,
        isLoading: false,
        hasLoaded: true,
      })
    })
  },
  addTodo: async () => {
    const title = get().draft.trim()
    if (!title) {
      return
    }

    await createTodo(title)
    set({ draft: '' })
  },
  toggleTodo: async (id) => {
    const todo = get().todos.find((currentTodo) => currentTodo.id === id)
    if (!todo) {
      return
    }

    await updateTodoDone(id, !todo.done)
  },
  removeTodo: async (id) => {
    await deleteTodo(id)
  },
  clearOpenTodos: async () => {
    await deleteOpenTodos(get().todos)
  },
}))
