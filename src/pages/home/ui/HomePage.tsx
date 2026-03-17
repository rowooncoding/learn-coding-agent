import { useState } from 'react'
import type { FormEvent } from 'react'
import HeroSummary from '../../../widgets/hero-summary/ui/HeroSummary'
import SidebarMenu from '../../../widgets/sidebar/ui/SidebarMenu'
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
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const todos = useTodoStore((state) => state.todos)
  const draft = useTodoStore((state) => state.draft)
  const filter = useTodoStore((state) => state.filter)
  const setDraft = useTodoStore((state) => state.setDraft)
  const setFilter = useTodoStore((state) => state.setFilter)
  const addTodo = useTodoStore((state) => state.addTodo)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const removeTodo = useTodoStore((state) => state.removeTodo)

  const openCount = getOpenCount(todos)
  const completedCount = todos.length - openCount
  const visibleTodos = getVisibleTodos(todos, filter)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addTodo()
  }

  return (
    <div className={`app-layout${isSidebarPinned ? ' sidebar-pinned' : ''}`}>
      <SidebarMenu
        totalCount={todos.length}
        openCount={openCount}
        completedCount={completedCount}
        onPinnedChange={setIsSidebarPinned}
      />

      <main className="app-shell">
        <HeroSummary
          openCount={openCount}
          totalCount={todos.length}
          filterLabel={getFilterLabel(filter)}
        />

        <section className="todo-panel">
          <TodoHeader filter={filter} onChangeFilter={setFilter} />
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
    </div>
  )
}

export default HomePage
