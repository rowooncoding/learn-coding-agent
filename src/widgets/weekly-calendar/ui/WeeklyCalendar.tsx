import { useCalendarStore } from '../../../entities/calendar/model/store'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function getWeekDates(): Date[] {
  const today = new Date()
  const day = today.getDay() // 0=Sun, 1=Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function WeeklyCalendar() {
  const events = useCalendarStore((state) => state.events)
  const weekDates = getWeekDates()
  const todayKey = toDateKey(new Date())

  const eventsByDate = events.reduce<Record<string, string[]>>((acc, event) => {
    if (!acc[event.dateKey]) {
      acc[event.dateKey] = []
    }
    acc[event.dateKey].push(event.title)
    return acc
  }, {})

  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar-grid">
        {weekDates.map((date, i) => {
          const key = toDateKey(date)
          const isToday = key === todayKey
          const dayEvents = eventsByDate[key] ?? []

          return (
            <div
              key={key}
              className={`weekly-calendar-col${isToday ? ' is-today' : ''}`}
            >
              <div className="weekly-calendar-day-label">{DAY_LABELS[i]}</div>
              <div className={`weekly-calendar-date${isToday ? ' is-today' : ''}`}>
                {date.getDate()}
              </div>
              <div className="weekly-calendar-events">
                {dayEvents.slice(0, 3).map((title, idx) => (
                  <span key={idx} className="weekly-calendar-chip">
                    {title}
                  </span>
                ))}
                {dayEvents.length > 3 && (
                  <span className="weekly-calendar-more">+{dayEvents.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyCalendar
