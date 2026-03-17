import type { FormEvent } from 'react'
import HeroSummary from '../../../widgets/hero-summary/ui/HeroSummary'
import TodoComposer from '../../../features/todo-create/ui/TodoComposer'
import TodoHeader from '../../../features/todo-filter/ui/TodoHeader'
import TodoList from '../../../entities/todo/ui/TodoList'
import {
  getFilterLabel,
  getOpenCount,
  getVisibleTodos,
  useTodoStore,
} from '../../../entities/todo/model/store'

function HomePage() {
  const todos = useTodoStore((state) => state.todos)
  const draft = useTodoStore((state) => state.draft)
  const filter = useTodoStore((state) => state.filter)
  const setDraft = useTodoStore((state) => state.setDraft)
  const setFilter = useTodoStore((state) => state.setFilter)
  const addTodo = useTodoStore((state) => state.addTodo)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const removeTodo = useTodoStore((state) => state.removeTodo)
  const clearOpenTodos = useTodoStore((state) => state.clearOpenTodos)

  const openCount = getOpenCount(todos)
  const visibleTodos = getVisibleTodos(todos, filter)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addTodo()
  }

  const handleClearOpenTodos = () => {
    if (openCount === 0) {
      return
    }

    const shouldClear = window.confirm(
      `열린 작업 ${openCount}개를 모두 삭제할까요?`,
    )

    if (!shouldClear) {
      return
    }

    clearOpenTodos()
  }

  return (
    <main className="app-shell">
      <HeroSummary
        openCount={openCount}
        totalCount={todos.length}
        filterLabel={getFilterLabel(filter)}
      />

      <section className="todo-panel">
        <TodoHeader
          filter={filter}
          openCount={openCount}
          onChangeFilter={setFilter}
          onClearOpenTodos={handleClearOpenTodos}
        />
        <TodoComposer
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={handleSubmit}
        />
        <TodoList
          todos={visibleTodos}
          onToggleTodo={toggleTodo}
          onRemoveTodo={removeTodo}
        />
      </section>
    </main>
  )
}

export default HomePage
