import type { Todo } from '../model/store'

type TodoListProps = {
  todos: Todo[]
  onToggleTodo: (id: number) => void
  onRemoveTodo: (id: number) => void
}

function TodoList({ todos, onToggleTodo, onRemoveTodo }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>지금은 열린 작업이 없습니다.</p>
        <span>필터를 바꾸거나 새 할 일을 추가하면 됩니다.</span>
      </div>
    )
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={`todo-item${todo.done ? ' done' : ''}`}>
          <button
            type="button"
            className="check-button"
            onClick={() => onToggleTodo(todo.id)}
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
            onClick={() => onRemoveTodo(todo.id)}
            aria-label={`${todo.title} 삭제`}
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  )
}

export default TodoList
