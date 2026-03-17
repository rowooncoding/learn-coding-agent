const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const buildCalendarDays = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1
    const current = new Date(year, month, dayNumber)
    const isCurrentMonth = current.getMonth() === month
    const isToday = current.toDateString() === new Date().toDateString()

    return {
      key: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`,
      label: current.getDate(),
      isCurrentMonth,
      isToday,
    }
  })
}

function CalendarView() {
  const today = new Date()
  const title = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })
  const days = buildCalendarDays(today)

  return (
    <section className="calendar-panel">
      <div className="calendar-header">
        <div>
          <p className="section-kicker">Calendar</p>
          <h2>{title}</h2>
        </div>
        <p className="calendar-meta">월간 보기</p>
      </div>

      <div className="calendar-grid calendar-grid-labels">
        {weekLabels.map((label) => (
          <span key={label} className="calendar-week-label">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-grid calendar-grid-days">
        {days.map((day) => (
          <article
            key={day.key}
            className={`calendar-day${day.isCurrentMonth ? '' : ' is-muted'}${day.isToday ? ' is-today' : ''}`}
          >
            <span className="calendar-day-number">{day.label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CalendarView
