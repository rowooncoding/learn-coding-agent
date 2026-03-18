import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

type SidebarMenuProps = {
  openCount: number
  onPinnedChange: (isPinnedOpen: boolean) => void
  userName: string
  onSignOut: () => Promise<void>
}

function SidebarMenu({
  openCount,
  onPinnedChange,
  userName,
  onSignOut,
}: SidebarMenuProps) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const isOpen = isPinnedOpen || isPreviewOpen

  useEffect(() => {
    onPinnedChange(isPinnedOpen)
  }, [isPinnedOpen, onPinnedChange])

  useEffect(() => {
    if (!isPinnedOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPinnedOpen(false)
      }
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsPinnedOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isPinnedOpen])

  return (
    <>
      <div
        ref={containerRef}
        className={`sidebar-shell${isOpen ? ' is-open' : ''}${isPinnedOpen ? ' is-pinned' : ''}`}
        onMouseEnter={() => setIsPreviewOpen(true)}
        onMouseLeave={() => setIsPreviewOpen(false)}
      >
        <button
          type="button"
          className="sidebar-toggle"
          aria-expanded={isPinnedOpen}
          aria-label={isPinnedOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setIsPinnedOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <aside className="sidebar-panel" aria-hidden={!isOpen}>
          <div className="sidebar-header">
            <div>
              <p className="sidebar-kicker">Workspace</p>
              <strong>Agent Todo</strong>
              <span className="sidebar-user">{userName}</span>
            </div>
            <button
              type="button"
              className="sidebar-close"
              aria-label="메뉴 접기"
              onClick={() => setIsPinnedOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="주요 메뉴">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span>대시보드</span>
              <em>Home</em>
            </NavLink>
            <NavLink to="/todo" end className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span>오늘 할 일</span>
              <em>{openCount}</em>
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span>Calendar</span>
              <em>View</em>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <button type="button" className="sidebar-signout" onClick={() => void onSignOut()}>
              로그아웃
            </button>
          </div>
        </aside>
      </div>

      {isPinnedOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setIsPinnedOpen(false)}
        />
      ) : null}
    </>
  )
}

export default SidebarMenu
