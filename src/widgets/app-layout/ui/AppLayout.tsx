import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import SidebarMenu from '../../sidebar/ui/SidebarMenu'
import { getOpenCount, useTodoStore } from '../../../entities/todo/model/store'

function AppLayout() {
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const todos = useTodoStore((state) => state.todos)
  const startTodosSubscription = useTodoStore(
    (state) => state.startTodosSubscription,
  )
  const openCount = getOpenCount(todos)

  useEffect(() => {
    const unsubscribe = startTodosSubscription()

    return () => {
      unsubscribe()
    }
  }, [startTodosSubscription])

  return (
    <div className={`app-layout${isSidebarPinned ? ' sidebar-pinned' : ''}`}>
      <SidebarMenu
        openCount={openCount}
        onPinnedChange={setIsSidebarPinned}
      />
      <Outlet />
    </div>
  )
}

export default AppLayout
