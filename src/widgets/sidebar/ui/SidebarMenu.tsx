import { useEffect, useRef, useState } from 'react'

type SidebarMenuProps = {
  totalCount: number
  openCount: number
  completedCount: number
  onPinnedChange: (isPinnedOpen: boolean) => void
}

function SidebarMenu({
  totalCount,
  openCount,
  completedCount,
  onPinnedChange,
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
            <button type="button" className="sidebar-item active">
              <span>Inbox</span>
              <em>{openCount}</em>
            </button>
            <button type="button" className="sidebar-item">
              <span>Today</span>
              <em>{totalCount}</em>
            </button>
            <button type="button" className="sidebar-item">
              <span>All Tasks</span>
              <em>{totalCount}</em>
            </button>
            <button type="button" className="sidebar-item">
              <span>Completed</span>
              <em>{completedCount}</em>
            </button>
          </nav>
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
