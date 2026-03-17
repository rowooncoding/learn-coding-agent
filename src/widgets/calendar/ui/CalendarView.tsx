import { Select } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: dayjs().month(index).format('MMM'),
  value: index,
}))

const yearOptions = Array.from({ length: 9 }, (_, index) => {
  const year = dayjs().year() - 4 + index

  return {
    label: `${year}`,
    value: year,
  }
})

function CalendarView() {
  const [currentValue, setCurrentValue] = useState(() => dayjs())
  const title = currentValue.format('YYYY년 M월')
  const daysInMonth = currentValue.daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  const handleYearChange = (year: number) => {
    setCurrentValue((current) => current.year(year))
  }

  const handleMonthChange = (month: number) => {
    setCurrentValue((current) => current.month(month))
  }

  return (
    <section className="calendar-panel">
      <div className="calendar-header">
        <div>
          <p className="section-kicker">Calendar</p>
          <h2>{title}</h2>
        </div>
        <div className="calendar-controls">
          <Select
            value={currentValue.year()}
            options={yearOptions}
            onChange={handleYearChange}
            className="calendar-select"
          />
          <Select
            value={currentValue.month()}
            options={monthOptions}
            onChange={handleMonthChange}
            className="calendar-select"
          />
        </div>
      </div>

      <div className="calendar-grid">
        {days.map((day) => (
          <article
            key={`${currentValue.year()}-${currentValue.month()}-${day}`}
            className={`calendar-cell${day === currentValue.date() ? ' is-current' : ''}`}
          >
            <span className="calendar-day-number">{day}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CalendarView
