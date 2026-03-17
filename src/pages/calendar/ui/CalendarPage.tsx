import HeroSummary from '../../../widgets/hero-summary/ui/HeroSummary'
import CalendarView from '../../../widgets/calendar/ui/CalendarView'
import {
  getOpenCount,
  useTodoStore,
} from '../../../entities/todo/model/store'

function CalendarPage() {
  const todos = useTodoStore((state) => state.todos)
  const openCount = getOpenCount(todos)

  return (
    <main className="app-shell">
      <HeroSummary
        openCount={openCount}
        totalCount={todos.length}
        filterLabel="Calendar"
        title="Calendar"
        description="이번 달 일정을 한눈에 확인하는 화면입니다."
        showSummary={false}
      />
      <CalendarView />
    </main>
  )
}

export default CalendarPage
