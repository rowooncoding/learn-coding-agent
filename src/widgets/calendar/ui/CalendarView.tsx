import { Button, Input, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useCalendarStore } from '../../../entities/calendar/model/store'

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
  const title = currentValue.format('YYYY년 M월')
  const daysInMonth = currentValue.daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

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
