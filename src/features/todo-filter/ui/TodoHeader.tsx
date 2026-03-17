import { Button, Segmented } from 'antd'
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
        <Segmented<TodoFilter>
          className="todo-filter-segmented"
          value={filter}
          onChange={(value) => onChangeFilter(value)}
          options={[
            { label: '전체', value: 'all' },
            { label: '진행중', value: 'active' },
            { label: '완료', value: 'done' },
          ]}
        />

        {openCount > 0 ? (
          <Button danger onClick={onClearOpenTodos} size="large">
            작업 일괄 삭제
          </Button>
        ) : null}

      </div>
    </div>
  )
}

export default TodoHeader
