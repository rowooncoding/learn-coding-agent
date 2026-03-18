import { Button, Input, Modal, Select, Segmented } from 'antd'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useEffect, useRef, useState } from 'react'
import { useCalendarStore } from '../../../entities/calendar/model/store'

dayjs.extend(isoWeek)

type ViewMode = 'month' | 'week'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

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

function getWeekDays(base: dayjs.Dayjs): dayjs.Dayjs[] {
  const monday = base.isoWeekday(1).startOf('day')
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'))
}

function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentValue, setCurrentValue] = useState(() => dayjs())
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [eventErrorMessage, setEventErrorMessage] = useState('')
  const reopenTimerRef = useRef<number | null>(null)
  const events = useCalendarStore((state) => state.events)
  const eventDraft = useCalendarStore((state) => state.eventDraft)
  const selectedDateKey = useCalendarStore((state) => state.selectedDateKey)
  const setEventDraft = useCalendarStore((state) => state.setEventDraft)
  const setSelectedDateKey = useCalendarStore((state) => state.setSelectedDateKey)
  const addCalendarEvent = useCalendarStore((state) => state.addCalendarEvent)

  const weekDays = getWeekDays(currentValue)
  const weekTitle = `${weekDays[0].format('YYYY년 M월 D일')} – ${weekDays[6].format('M월 D일')}`
  const monthTitle = currentValue.format('YYYY년 M월')
  const title = viewMode === 'week' ? weekTitle : monthTitle

  const daysInMonth = currentValue.daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  const handlePrevWeek = () => setCurrentValue((cur) => cur.subtract(1, 'week'))
  const handleNextWeek = () => setCurrentValue((cur) => cur.add(1, 'week'))

  const handleYearChange = (year: number) => {
    setCurrentValue((current) => current.year(year))
  }

  const handleMonthChange = (month: number) => {
    setCurrentValue((current) => current.month(month))
  }

  const handleOpenEventModal = (day: number) => {
    const nextDate = currentValue.date(day)
    setSelectedDateKey(nextDate.format('YYYY-MM-DD'))
    setEventDraft('')
    setEventErrorMessage('')
    setIsEventModalOpen(true)
  }

  const handleOpenDetails = (day: number) => {
    const nextDate = currentValue.date(day)
    const nextDateKey = nextDate.format('YYYY-MM-DD')

    if (isDetailsOpen && selectedDateKey && selectedDateKey !== nextDateKey) {
      setIsDetailsOpen(false)

      if (reopenTimerRef.current) {
        window.clearTimeout(reopenTimerRef.current)
      }

      reopenTimerRef.current = window.setTimeout(() => {
        setSelectedDateKey(nextDateKey)
        setIsDetailsOpen(true)
      }, 140)

      return
    }

    setSelectedDateKey(nextDateKey)
    setIsDetailsOpen(true)
  }

  const selectedEvents = events.filter(
    (event) => event.dateKey === selectedDateKey,
  )

  const handleCreateEvent = async () => {
    try {
      setIsSavingEvent(true)
      setEventErrorMessage('')
      await addCalendarEvent()
      setIsEventModalOpen(false)
    } catch (error) {
      setEventErrorMessage(
        error instanceof Error
          ? error.message
          : '일정 저장 중 문제가 발생했습니다.',
      )
    } finally {
      setIsSavingEvent(false)
    }
  }

  useEffect(() => {
    return () => {
      if (reopenTimerRef.current) {
        window.clearTimeout(reopenTimerRef.current)
      }
    }
  }, [])

  return (
    <section className="calendar-panel">
      <div className="calendar-header">
        <div>
          <p className="section-kicker">Calendar</p>
          <h2>{title}</h2>
        </div>
        <div className="calendar-controls">
          <Segmented<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: '월간', value: 'month' },
              { label: '주간', value: 'week' },
            ]}
          />
          {viewMode === 'month' ? (
            <>
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
            </>
          ) : (
            <div className="calendar-week-nav">
              <button type="button" className="calendar-week-nav-btn" onClick={handlePrevWeek} aria-label="이전 주">‹</button>
              <button type="button" className="calendar-week-nav-btn" onClick={handleNextWeek} aria-label="다음 주">›</button>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar-grid">
          {days.map((day) => (
            <button
              type="button"
              key={`${currentValue.year()}-${currentValue.month()}-${day}`}
              className={`calendar-cell${day === currentValue.date() ? ' is-current' : ''}`}
              onClick={() => handleOpenDetails(day)}
              onDoubleClick={() => handleOpenEventModal(day)}
            >
              <span className="calendar-day-number">{day}</span>
              <div className="calendar-events">
                {events
                  .filter(
                    (event) =>
                      event.dateKey === currentValue.date(day).format('YYYY-MM-DD'),
                  )
                  .slice(0, 2)
                  .map((event) => (
                    <span key={event.id} className="calendar-event-chip">
                      {event.title}
                    </span>
                  ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="calendar-week-grid">
          {weekDays.map((day, i) => {
            const dateKey = day.format('YYYY-MM-DD')
            const today = dayjs().format('YYYY-MM-DD')
            const isToday = dateKey === today
            const dayEvents = events.filter((e) => e.dateKey === dateKey)

            return (
              <div key={dateKey} className={`calendar-week-col${isToday ? ' is-today' : ''}`}>
                <div className="calendar-week-col-header">
                  <span className="calendar-week-day-label">{DAY_LABELS[i]}</span>
                  <span className={`calendar-week-date-num${isToday ? ' is-today' : ''}`}>
                    {day.date()}
                  </span>
                </div>
                <button
                  type="button"
                  className="calendar-week-body"
                  onClick={() => {
                    setSelectedDateKey(dateKey)
                    setIsDetailsOpen(true)
                  }}
                  onDoubleClick={() => {
                    setSelectedDateKey(dateKey)
                    setEventDraft('')
                    setEventErrorMessage('')
                    setIsEventModalOpen(true)
                  }}
                  aria-label={`${dateKey} 일정 보기`}
                >
                  <div className="calendar-events">
                    {dayEvents.map((event) => (
                      <span key={event.id} className="calendar-event-chip">
                        {event.title}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {isDetailsOpen && selectedDateKey ? (
        <aside className="calendar-details">
          <div className="calendar-details-header">
            <div>
              <p className="section-kicker">Schedule</p>
              <h3>{selectedDateKey}</h3>
            </div>
            <button
              type="button"
              className="calendar-details-close"
              onClick={() => setIsDetailsOpen(false)}
            >
              닫기
            </button>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="calendar-details-list">
              {selectedEvents.map((event) => (
                <article key={event.id} className="calendar-details-item">
                  <strong>{event.title}</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="calendar-details-empty">
              <p>등록된 일정이 없습니다.</p>
              <span>날짜를 더블 클릭해서 새 일정을 추가할 수 있습니다.</span>
            </div>
          )}
        </aside>
      ) : null}

      <Modal
        open={isEventModalOpen}
        title={
          selectedDateKey ? `${selectedDateKey} 일정 등록` : '일정 등록'
        }
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsEventModalOpen(false)}
            disabled={isSavingEvent}
          >
            취소
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isSavingEvent}
            onClick={() => void handleCreateEvent()}
          >
            저장
          </Button>,
        ]}
        onCancel={() => setIsEventModalOpen(false)}
      >
        <Input
          value={eventDraft}
          onChange={(event) => setEventDraft(event.target.value)}
          placeholder="등록할 일정 제목"
          size="large"
        />
        {eventErrorMessage ? <p>{eventErrorMessage}</p> : null}
      </Modal>
    </section>
  )
}

export default CalendarView
