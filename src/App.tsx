import type { FormEvent } from 'react'
import './App.css'
import {
  getFilterLabel,
  getOpenCount,
  getVisibleTodos,
  useTodoStore,
} from './store/useTodoStore'

function App() {
  const todos = useTodoStore((state) => state.todos)
  const draft = useTodoStore((state) => state.draft)
  const filter = useTodoStore((state) => state.filter)
  const setDraft = useTodoStore((state) => state.setDraft)
  const setFilter = useTodoStore((state) => state.setFilter)
  const addTodo = useTodoStore((state) => state.addTodo)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const removeTodo = useTodoStore((state) => state.removeTodo)

  const openCount = getOpenCount(todos)
  const visibleTodos = getVisibleTodos(todos, filter)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addTodo()
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">PERSONAL TODO WEB</p>
        <div className="hero-copy">
          <h1>할 일을 가볍게 정리하는 화면</h1>
          <p>
            바로 추가하고, 체크하고, 지우는 데만 집중한 간단한 todo list입니다.
          </p>
        </div>

        <div className="summary-grid">
          <article className="summary-card accent">
            <span className="summary-label">열린 작업</span>
            <strong>{openCount}</strong>
          </article>
          <article className="summary-card">
            <span className="summary-label">전체 작업</span>
            <strong>{todos.length}</strong>
          </article>
          <article className="summary-card">
            <span className="summary-label">현재 보기</span>
            <strong>{getFilterLabel(filter)}</strong>
          </article>
        </div>
      </section>

      <section className="todo-panel">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Tasks</p>
            <h2>오늘의 todo list</h2>
          </div>
          <div className="filter-group" role="tablist" aria-label="할 일 필터">
            <button
              type="button"
              className={`ghost-button${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체
            </button>
            <button
              type="button"
              className={`ghost-button${filter === 'active' ? ' active' : ''}`}
              onClick={() => setFilter('active')}
            >
              진행중
            </button>
            <button
              type="button"
              className={`ghost-button${filter === 'done' ? ' active' : ''}`}
              onClick={() => setFilter('done')}
            >
              완료
            </button>
          </div>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="todo-input">
            새 작업
          </label>
          <input
            id="todo-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="예: 장보기, 문서 정리, 운동 가기"
          />
          <button type="submit" className="primary-button">
            추가
          </button>
        </form>

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={`todo-item${todo.done ? ' done' : ''}`}>
              <button
                type="button"
                className="check-button"
                onClick={() => toggleTodo(todo.id)}
                aria-pressed={todo.done}
                aria-label={
                  todo.done
                    ? `${todo.title} 작업 다시 열기`
                    : `${todo.title} 작업 완료 처리`
                }
              >
                {todo.done ? '완료' : '진행'}
              </button>

              <p>{todo.title}</p>

              <button
                type="button"
                className="delete-button"
                onClick={() => removeTodo(todo.id)}
                aria-label={`${todo.title} 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 ? (
          <div className="empty-state">
            <p>지금은 열린 작업이 없습니다.</p>
            <span>필터를 바꾸거나 새 할 일을 추가하면 됩니다.</span>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default App
