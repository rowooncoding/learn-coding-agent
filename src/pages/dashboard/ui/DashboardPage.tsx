import { Button, Modal } from 'antd'
import { useState } from 'react'
import type { FormEvent } from 'react'
import TodoComposer from '../../../features/todo-create/ui/TodoComposer'
import TodoHeader from '../../../features/todo-filter/ui/TodoHeader'
import TodoList from '../../../entities/todo/ui/TodoList'
import WeeklyCalendar from '../../../widgets/weekly-calendar/ui/WeeklyCalendar'
import {
  getOpenCount,
  getVisibleTodos,
  useTodoStore,
} from '../../../entities/todo/model/store'

function DashboardPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeletingOpenTodos, setIsDeletingOpenTodos] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('')

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await addTodo()
  }

  const handleClearOpenTodos = () => {
    if (openCount === 0) return
    setDeleteErrorMessage('')
    setIsDeleteModalOpen(true)
  }

  const handleConfirmClearOpenTodos = async () => {
    try {
      setIsDeletingOpenTodos(true)
      setDeleteErrorMessage('')
      await clearOpenTodos()
      setIsDeleteModalOpen(false)
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error
          ? error.message
          : '삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsDeletingOpenTodos(false)
    }
  }

  return (
    <main className="app-shell">
      <div className="dashboard-grid">
        {/* 왼쪽: 주간 캘린더 + 가계부 */}
        <div className="dashboard-left">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <p className="section-kicker">이번 주</p>
              <h2>주간 캘린더</h2>
            </div>
            <WeeklyCalendar />
          </div>

          <div className="dashboard-panel dashboard-ledger">
            <div className="dashboard-panel-header">
              <p className="section-kicker">Finance</p>
              <h2>가계부</h2>
            </div>
            <div className="dashboard-ledger-placeholder">
              <p>준비 중</p>
              <span>가계부 기능이 곧 추가될 예정입니다.</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 오늘 할 일 */}
        <div className="todo-panel dashboard-todo">
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
        </div>
      </div>

      <Modal
        open={isDeleteModalOpen}
        title="열린 작업을 삭제할까요?"
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isDeletingOpenTodos}
          >
            취소
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            loading={isDeletingOpenTodos}
            onClick={() => void handleConfirmClearOpenTodos()}
          >
            삭제
          </Button>,
        ]}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        <p>현재 열린 작업 {openCount}개가 삭제됩니다.</p>
        {deleteErrorMessage ? <p>{deleteErrorMessage}</p> : null}
      </Modal>
    </main>
  )
}

export default DashboardPage
