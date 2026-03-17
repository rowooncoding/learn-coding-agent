import type { TodoFilter } from '../../../entities/todo/model/store'

type TodoHeaderProps = {
  filter: TodoFilter
  onChangeFilter: (filter: TodoFilter) => void
}

function TodoHeader({ filter, onChangeFilter }: TodoHeaderProps) {
  return (
    <div className="panel-header">
      <div>
        <p className="section-kicker">Tasks</p>
        <h2>오늘의 todo list</h2>
      </div>
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
    </div>
  )
}

export default TodoHeader
