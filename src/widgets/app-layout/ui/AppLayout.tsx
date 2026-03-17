import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarMenu from '../../sidebar/ui/SidebarMenu'
import { getOpenCount, useTodoStore } from '../../../entities/todo/model/store'
import { useAuth } from '../../../shared/auth/model/AuthProvider'

function AppLayout() {
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const { signOut, user } = useAuth()
  const todos = useTodoStore((state) => state.todos)
  const startTodosSubscription = useTodoStore(
    (state) => state.startTodosSubscription,
  )
  const resetTodos = useTodoStore((state) => state.resetTodos)
  const openCount = getOpenCount(todos)

  useEffect(() => {
    if (!user) {
      resetTodos()
      return
    }

    const unsubscribe = startTodosSubscription(user.uid)

    return () => {
      unsubscribe()
    }
  }, [resetTodos, startTodosSubscription, user])

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
