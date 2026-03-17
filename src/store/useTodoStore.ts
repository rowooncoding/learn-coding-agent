import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Todo = {
  id: number
  title: string
  done: boolean
}

export type TodoFilter = 'all' | 'active' | 'done'

type TodoStore = {
  todos: Todo[]
  draft: string
  filter: TodoFilter
  setDraft: (draft: string) => void
  setFilter: (filter: TodoFilter) => void
  addTodo: () => void
  toggleTodo: (id: number) => void
  removeTodo: (id: number) => void
}

const initialTodos: Todo[] = [
  { id: 1, title: '첫 번째 할 일 추가하기', done: false },
  { id: 2, title: '끝난 항목 체크해보기', done: false },
  { id: 3, title: '필요 없는 항목 삭제하기', done: true },
]

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

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: initialTodos,
      draft: '',
      filter: 'all',
      setDraft: (draft) => set({ draft }),
      setFilter: (filter) => set({ filter }),
      addTodo: () => {
        const title = get().draft.trim()
        if (!title) {
          return
        }

        set((state) => ({
          draft: '',
          todos: [
            {
              id: Date.now(),
              title,
              done: false,
            },
            ...state.todos,
          ],
        }))
      },
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, done: !todo.done } : todo,
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
    }),
    {
      name: 'todo-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        todos: state.todos,
      }),
    },
  ),
)
