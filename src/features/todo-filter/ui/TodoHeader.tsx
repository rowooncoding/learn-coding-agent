import type { TodoFilter } from '../../../entities/todo/model/store'

type TodoHeaderProps = {
  filter: TodoFilter
  openCount: number
  onChangeFilter: (filter: TodoFilter) => void
  onClearOpenTodos: () => void
}

function TodoHeader({
  filter,
  openCount,
  onChangeFilter,
  onClearOpenTodos,
}: TodoHeaderProps) {
  return (
    <div className="panel-header">
      <div>
        <p className="section-kicker">Tasks</p>
        <h2>오늘의 todo list</h2>
      </div>
      <div className="panel-actions">
        <div className="filter-group" role="tablist" aria-label="할 일 필터">
          <button
            type="button"
            className={`ghost-button${filter === 'all' ? ' active' : ''}`}
            onClick={() => onChangeFilter('all')}
          >
            전체
          </button>
          <button
            type="button"
            className={`ghost-button${filter === 'active' ? ' active' : ''}`}
            onClick={() => onChangeFilter('active')}
          >
            진행중
          </button>
          <button
            type="button"
            className={`ghost-button${filter === 'done' ? ' active' : ''}`}
            onClick={() => onChangeFilter('done')}
          >
            완료
          </button>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={onClearOpenTodos}
          disabled={openCount === 0}
        >
          열린 작업 삭제
        </button>
      </div>
    </div>
  )
}

export default TodoHeader
