import { Button, Checkbox, Input, Modal, Select, Segmented, TimePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useEffect, useRef, useState } from 'react'
import { useCalendarStore } from '../../../entities/calendar/model/store'
import type { CalendarEvent } from '../../../entities/calendar/api/events'

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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editAllDay, setEditAllDay] = useState(true)
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false)
  const [editErrorMessage, setEditErrorMessage] = useState('')
  const reopenTimerRef = useRef<number | null>(null)
  const events = useCalendarStore((state) => state.events)
  const eventDraft = useCalendarStore((state) => state.eventDraft)
  const eventContent = useCalendarStore((state) => state.eventContent)
  const eventAllDay = useCalendarStore((state) => state.eventAllDay)
  const eventStartTime = useCalendarStore((state) => state.eventStartTime)
  const eventEndTime = useCalendarStore((state) => state.eventEndTime)
  const selectedDateKey = useCalendarStore((state) => state.selectedDateKey)
  const setEventDraft = useCalendarStore((state) => state.setEventDraft)
  const setEventContent = useCalendarStore((state) => state.setEventContent)
  const setEventAllDay = useCalendarStore((state) => state.setEventAllDay)
  const setEventStartTime = useCalendarStore((state) => state.setEventStartTime)
  const setEventEndTime = useCalendarStore((state) => state.setEventEndTime)
  const setSelectedDateKey = useCalendarStore((state) => state.setSelectedDateKey)
  const addCalendarEvent = useCalendarStore((state) => state.addCalendarEvent)
  const removeCalendarEvent = useCalendarStore((state) => state.removeCalendarEvent)
  const clearDateEvents = useCalendarStore((state) => state.clearDateEvents)
  const editCalendarEvent = useCalendarStore((state) => state.editCalendarEvent)
  const resetEventForm = useCalendarStore((state) => state.resetEventForm)

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
    resetEventForm()
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

  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setEditTitle(event.title)
    setEditContent(event.content)
    setEditAllDay(event.allDay)
    setEditStartTime(event.startTime)
    setEditEndTime(event.endTime)
    setEditErrorMessage('')
  }

  const handleCloseEditModal = () => {
    setEditingEvent(null)
    setEditErrorMessage('')
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent) return
    try {
      setIsUpdatingEvent(true)
      setEditErrorMessage('')
      await editCalendarEvent(editingEvent.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        allDay: editAllDay,
        startTime: editAllDay ? '' : editStartTime,
        endTime: editAllDay ? '' : editEndTime,
      })
      setEditingEvent(null)
    } catch (error) {
      setEditErrorMessage(
        error instanceof Error ? error.message : '수정 중 문제가 발생했습니다.',
      )
    } finally {
      setIsUpdatingEvent(false)
    }
  }

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
                    resetEventForm()
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
            <div className="calendar-details-actions">
              {selectedEvents.length > 0 && (
                <button
                  type="button"
                  className="calendar-details-bulk-delete"
                  onClick={() => void clearDateEvents(selectedDateKey)}
                  aria-label="이 날 일정 전체 삭제"
                >
                  일괄 삭제
                </button>
              )}
              <button
                type="button"
                className="calendar-details-close"
                onClick={() => setIsDetailsOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="calendar-details-list">
              {selectedEvents.map((event) => (
                <article key={event.id} className="calendar-details-item">
                  <div className="calendar-details-item-header">
                    <button
                      type="button"
                      className="calendar-event-edit-trigger"
                      onClick={() => handleOpenEditModal(event)}
                    >
                      <strong>{event.title}</strong>
                      {!event.allDay && (event.startTime || event.endTime) && (
                        <p className="calendar-details-time">
                          {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                        </p>
                      )}
                      {event.allDay && (
                        <p className="calendar-details-time">하루종일</p>
                      )}
                      {event.content && (
                        <p className="calendar-details-content">{event.content}</p>
                      )}
                    </button>
                    <button
                      type="button"
                      className="calendar-event-delete"
                      onClick={() => void removeCalendarEvent(event.id)}
                      aria-label={`${event.title} 삭제`}
                    >
                      삭제
                    </button>
                  </div>
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
        <div className="event-form">
          <div className="event-form-field">
            <label className="event-form-label">제목</label>
            <Input
              value={eventDraft}
              onChange={(e) => setEventDraft(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              size="large"
            />
          </div>

          <div className="event-form-field">
            <label className="event-form-label">내용</label>
            <Input.TextArea
              value={eventContent}
              onChange={(e) => setEventContent(e.target.value)}
              placeholder="일정 내용을 입력하세요 (선택)"
              rows={3}
            />
          </div>

          <div className="event-form-field">
            <Checkbox
              checked={eventAllDay}
              onChange={(e) => setEventAllDay(e.target.checked)}
            >
              하루종일
            </Checkbox>
          </div>

          {!eventAllDay && (
            <div className="event-form-time-row">
              <div className="event-form-field">
                <label className="event-form-label">시작 시간</label>
                <TimePicker
                  value={eventStartTime ? dayjs(eventStartTime, 'HH:mm') : null}
                  onChange={(time: Dayjs | null) => setEventStartTime(time ? time.format('HH:mm') : '')}
                  format="HH:mm"
                  minuteStep={10}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="시작 시간"
                />
              </div>
              <div className="event-form-field">
                <label className="event-form-label">종료 시간</label>
                <TimePicker
                  value={eventEndTime ? dayjs(eventEndTime, 'HH:mm') : null}
                  onChange={(time: Dayjs | null) => setEventEndTime(time ? time.format('HH:mm') : '')}
                  format="HH:mm"
                  minuteStep={10}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="종료 시간"
                />
              </div>
            </div>
          )}

          {eventErrorMessage ? <p className="event-form-error">{eventErrorMessage}</p> : null}
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        open={editingEvent !== null}
        title="일정 수정"
        footer={[
          <Button key="cancel" onClick={handleCloseEditModal} disabled={isUpdatingEvent}>
            취소
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isUpdatingEvent}
            disabled={!editTitle.trim()}
            onClick={() => void handleUpdateEvent()}
          >
            저장
          </Button>,
        ]}
        onCancel={handleCloseEditModal}
      >
        <div className="event-form">
          <div className="event-form-field">
            <label className="event-form-label">제목</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              size="large"
            />
          </div>

          <div className="event-form-field">
            <label className="event-form-label">내용</label>
            <Input.TextArea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="일정 내용을 입력하세요 (선택)"
              rows={3}
            />
          </div>

          <div className="event-form-field">
            <Checkbox
              checked={editAllDay}
              onChange={(e) => setEditAllDay(e.target.checked)}
            >
              하루종일
            </Checkbox>
          </div>

          {!editAllDay && (
            <div className="event-form-time-row">
              <div className="event-form-field">
                <label className="event-form-label">시작 시간</label>
                <TimePicker
                  value={editStartTime ? dayjs(editStartTime, 'HH:mm') : null}
                  onChange={(time: Dayjs | null) => setEditStartTime(time ? time.format('HH:mm') : '')}
                  format="HH:mm"
                  minuteStep={10}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="시작 시간"
                />
              </div>
              <div className="event-form-field">
                <label className="event-form-label">종료 시간</label>
                <TimePicker
                  value={editEndTime ? dayjs(editEndTime, 'HH:mm') : null}
                  onChange={(time: Dayjs | null) => setEditEndTime(time ? time.format('HH:mm') : '')}
                  format="HH:mm"
                  minuteStep={10}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="종료 시간"
                />
              </div>
            </div>
          )}

          {editErrorMessage ? <p className="event-form-error">{editErrorMessage}</p> : null}
        </div>
      </Modal>
    </section>
  )
}

export default CalendarView
