import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarMenu from '../../sidebar/ui/SidebarMenu'
import { getOpenCount, useTodoStore } from '../../../entities/todo/model/store'
import { useCalendarStore } from '../../../entities/calendar/model/store'
import { useAuth } from '../../../shared/auth/model/AuthProvider'

function AppLayout() {
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const { signOut, user } = useAuth()
  const todos = useTodoStore((state) => state.todos)
  const startTodosSubscription = useTodoStore(
    (state) => state.startTodosSubscription,
  )
  const resetTodos = useTodoStore((state) => state.resetTodos)
  const startCalendarSubscription = useCalendarStore(
    (state) => state.startCalendarSubscription,
  )
  const resetCalendar = useCalendarStore((state) => state.resetCalendar)
  const openCount = getOpenCount(todos)

  useEffect(() => {
    if (!user) {
      resetTodos()
      resetCalendar()
      return
    }

    const unsubscribeTodos = startTodosSubscription(user.uid)
    const unsubscribeCalendar = startCalendarSubscription(user.uid)

    return () => {
      unsubscribeTodos()
      unsubscribeCalendar()
    }
  }, [resetCalendar, resetTodos, startCalendarSubscription, startTodosSubscription, user])

  return (
    <div className={`app-layout${isSidebarPinned ? ' sidebar-pinned' : ''}`}>
      <SidebarMenu
        openCount={openCount}
        onPinnedChange={setIsSidebarPinned}
        userName={user?.displayName ?? user?.email ?? 'User'}
        onSignOut={signOut}
      />
      <Outlet />
    </div>
  )
}

export default AppLayout
