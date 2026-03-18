import { Button, Checkbox, Input, Modal, Select, Segmented, TimePicker } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useEffect, useRef, useState } from 'react'
import { useCalendarStore } from '../../../entities/calendar/model/store'
import type { CalendarEvent } from '../../../entities/calendar/api/events'

dayjs.extend(isoWeek)

type ViewMode = 'month' | 'week' | 'day'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const HOUR_HEIGHT = 64

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: dayjs().month(i).format('MMM'),
  value: i,
}))

const yearOptions = Array.from({ length: 9 }, (_, i) => {
  const year = dayjs().year() - 4 + i
  return { label: `${year}`, value: year }
})

function getWeekDays(base: dayjs.Dayjs): dayjs.Dayjs[] {
  const monday = base.isoWeekday(1).startOf('day')
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'))
}

function timeToMinutes(time: string): number {
  const parts = time.split(':')
  return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10)
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
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  const reopenTimerRef = useRef<number | null>(null)
  const dayTimelineRef = useRef<HTMLDivElement | null>(null)
  const weekTimelineRef = useRef<HTMLDivElement | null>(null)

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

  const todayKey = dayjs().format('YYYY-MM-DD')
  const weekDays = getWeekDays(currentValue)
  const weekTitle = `${weekDays[0].format('YYYY년 M월 D일')} – ${weekDays[6].format('M월 D일')}`
  const monthTitle = currentValue.format('YYYY년 M월')
  const dayTitle = `${currentValue.format('YYYY년 M월 D일')} (${DAY_NAMES[currentValue.day()]})`
  const title = viewMode === 'week' ? weekTitle : viewMode === 'day' ? dayTitle : monthTitle

  const daysInMonth = currentValue.daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Day view data
  const dayDateKey = currentValue.format('YYYY-MM-DD')
  const isViewingToday = dayDateKey === todayKey
  const dayAllEvents = events.filter((e) => e.dateKey === dayDateKey)
  const allDayDayEvents = dayAllEvents.filter((e) => e.allDay)
  const timedDayEvents = dayAllEvents
    .filter((e) => !e.allDay && e.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Week timeline data
  const isCurrentWeek = weekDays.some((d) => d.format('YYYY-MM-DD') === todayKey)

  // Handlers
  const handlePrevWeek = () => setCurrentValue((cur) => cur.subtract(1, 'week'))
  const handleNextWeek = () => setCurrentValue((cur) => cur.add(1, 'week'))
  const handlePrevDay = () => setCurrentValue((cur) => cur.subtract(1, 'day'))
  const handleNextDay = () => setCurrentValue((cur) => cur.add(1, 'day'))
  const handleGoToday = () => setCurrentValue(dayjs())
  const handleYearChange = (year: number) => setCurrentValue((cur) => cur.year(year))
  const handleMonthChange = (month: number) => setCurrentValue((cur) => cur.month(month))

  const openEventModal = (dateKey: string) => {
    setSelectedDateKey(dateKey)
    resetEventForm()
    setEventErrorMessage('')
    setIsEventModalOpen(true)
  }

  const handleOpenEventModal = (day: number) => {
    openEventModal(currentValue.date(day).format('YYYY-MM-DD'))
  }

  const handleOpenDetails = (day: number) => {
    const nextDate = currentValue.date(day)
    const nextDateKey = nextDate.format('YYYY-MM-DD')

    if (isDetailsOpen && selectedDateKey && selectedDateKey !== nextDateKey) {
      setIsDetailsOpen(false)
      if (reopenTimerRef.current) window.clearTimeout(reopenTimerRef.current)
      reopenTimerRef.current = window.setTimeout(() => {
        setSelectedDateKey(nextDateKey)
        setIsDetailsOpen(true)
      }, 140)
      return
    }

    setSelectedDateKey(nextDateKey)
    setIsDetailsOpen(true)
  }

  const selectedEvents = events.filter((e) => e.dateKey === selectedDateKey)

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
      setEditErrorMessage(error instanceof Error ? error.message : '수정 중 문제가 발생했습니다.')
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
      setEventErrorMessage(error instanceof Error ? error.message : '일정 저장 중 문제가 발생했습니다.')
    } finally {
      setIsSavingEvent(false)
    }
  }

  // Update current time every minute
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date()
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes())
    }, 60000)
    return () => window.clearInterval(interval)
  }, [])

  // Scroll to current time when entering day/week view
  useEffect(() => {
    const scrollTop = Math.max(0, currentTimeMinutes * (HOUR_HEIGHT / 60) - 200)
    if (viewMode === 'day' && dayTimelineRef.current) {
      dayTimelineRef.current.scrollTop = scrollTop
    }
    if (viewMode === 'week' && weekTimelineRef.current) {
      weekTimelineRef.current.scrollTop = scrollTop
    }
  }, [viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (reopenTimerRef.current) window.clearTimeout(reopenTimerRef.current) }
  }, [])

  // Shared event form JSX
  const renderEventForm = (
    title: string, setTitle: (v: string) => void,
    content: string, setContent: (v: string) => void,
    allDay: boolean, setAllDay: (v: boolean) => void,
    startTime: string, setStart: (v: string) => void,
    endTime: string, setEnd: (v: string) => void,
    errorMsg: string,
  ) => (
    <div className="event-form">
      <div className="event-form-field">
        <label className="event-form-label">제목</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목을 입력하세요" size="large" />
      </div>
      <div className="event-form-field">
        <label className="event-form-label">내용</label>
        <Input.TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="일정 내용을 입력하세요 (선택)" rows={3} />
      </div>
      <div className="event-form-field">
        <Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)}>하루종일</Checkbox>
      </div>
      {!allDay && (
        <div className="event-form-time-row">
          <div className="event-form-field">
            <label className="event-form-label">시작 시간</label>
            <TimePicker value={startTime ? dayjs(startTime, 'HH:mm') : null} onChange={(t: Dayjs | null) => setStart(t ? t.format('HH:mm') : '')} format="HH:mm" minuteStep={10} size="large" style={{ width: '100%' }} placeholder="시작 시간" />
          </div>
          <div className="event-form-field">
            <label className="event-form-label">종료 시간</label>
            <TimePicker value={endTime ? dayjs(endTime, 'HH:mm') : null} onChange={(t: Dayjs | null) => setEnd(t ? t.format('HH:mm') : '')} format="HH:mm" minuteStep={10} size="large" style={{ width: '100%' }} placeholder="종료 시간" />
          </div>
        </div>
      )}
      {errorMsg ? <p className="event-form-error">{errorMsg}</p> : null}
    </div>
  )

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
              { label: '일간', value: 'day' },
            ]}
          />
          {viewMode === 'month' ? (
            <>
              <Select value={currentValue.year()} options={yearOptions} onChange={handleYearChange} className="calendar-select" />
              <Select value={currentValue.month()} options={monthOptions} onChange={handleMonthChange} className="calendar-select" />
            </>
          ) : viewMode === 'week' ? (
            <div className="calendar-week-nav">
              <button type="button" className="calendar-week-nav-btn" onClick={handlePrevWeek} aria-label="이전 주">‹</button>
              {!isCurrentWeek && <button type="button" className="calendar-today-btn" onClick={handleGoToday}>오늘</button>}
              <button type="button" className="calendar-week-nav-btn" onClick={handleNextWeek} aria-label="다음 주">›</button>
            </div>
          ) : (
            <div className="calendar-week-nav">
              <button type="button" className="calendar-week-nav-btn" onClick={handlePrevDay} aria-label="이전 날">‹</button>
              {!isViewingToday && <button type="button" className="calendar-today-btn" onClick={handleGoToday}>오늘</button>}
              <button type="button" className="calendar-week-nav-btn" onClick={handleNextDay} aria-label="다음 날">›</button>
            </div>
          )}
        </div>
      </div>

      {/* ── 월간 ── */}
      {viewMode === 'month' ? (
        <div className="calendar-grid">
          {days.map((day) => (
            <button
              type="button"
              key={`${currentValue.year()}-${currentValue.month()}-${day}`}
              className={`calendar-cell${currentValue.date(day).format('YYYY-MM-DD') === todayKey ? ' is-current' : ''}`}
              onClick={() => handleOpenDetails(day)}
              onDoubleClick={() => handleOpenEventModal(day)}
            >
              <span className="calendar-day-number">{day}</span>
              <div className="calendar-events">
                {events
                  .filter((e) => e.dateKey === currentValue.date(day).format('YYYY-MM-DD'))
                  .slice(0, 2)
                  .map((e) => <span key={e.id} className="calendar-event-chip">{e.title}</span>)}
              </div>
            </button>
          ))}
        </div>

      /* ── 주간 타임라인 ── */
      ) : viewMode === 'week' ? (
        <div className="calendar-wtl-wrap">
          {/* 요일 헤더 */}
          <div className="calendar-wtl-header">
            <div className="calendar-wtl-gutter" />
            {weekDays.map((day, i) => {
              const dk = day.format('YYYY-MM-DD')
              const isToday = dk === todayKey
              return (
                <div key={dk} className={`calendar-wtl-header-cell${isToday ? ' is-today' : ''}`}>
                  <span className="calendar-week-day-label">{DAY_LABELS[i]}</span>
                  <span className={`calendar-week-date-num${isToday ? ' is-today' : ''}`}>{day.date()}</span>
                </div>
              )
            })}
          </div>

          {/* 종일 이벤트 행 */}
          <div className="calendar-wtl-allday-row">
            <div className="calendar-wtl-allday-gutter">종일</div>
            {weekDays.map((day) => {
              const dk = day.format('YYYY-MM-DD')
              const allDayEvts = events.filter((e) => e.dateKey === dk && e.allDay)
              return (
                <div key={dk} className="calendar-wtl-allday-col">
                  {allDayEvts.map((e) => (
                    <button key={e.id} type="button" className="calendar-wtl-allday-chip" onClick={() => handleOpenEditModal(e)}>
                      {e.title}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          {/* 타임라인 */}
          <div className="calendar-wtl-scroll" ref={weekTimelineRef}>
            <div className="calendar-wtl-inner" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
              {/* 시간 행 */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="calendar-wtl-hour-row" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                  <span className="calendar-wtl-hour-label">{String(i).padStart(2, '0')}:00</span>
                  <div className="calendar-wtl-hour-line" />
                </div>
              ))}

              {/* 이벤트 그리드 (7열) */}
              <div className="calendar-wtl-events-grid">
                {weekDays.map((day) => {
                  const dk = day.format('YYYY-MM-DD')
                  const isToday = dk === todayKey
                  const timedEvts = events
                    .filter((e) => e.dateKey === dk && !e.allDay && e.startTime)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))

                  return (
                    <div
                      key={dk}
                      className={`calendar-wtl-day-col${isToday ? ' is-today' : ''}`}
                      onDoubleClick={() => openEventModal(dk)}
                    >
                      {timedEvts.map((evt) => {
                        const startMin = timeToMinutes(evt.startTime)
                        const endMin = evt.endTime ? timeToMinutes(evt.endTime) : startMin + 60
                        const top = startMin * (HOUR_HEIGHT / 60)
                        const height = Math.max((endMin - startMin) * (HOUR_HEIGHT / 60), 22)
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            className="calendar-wtl-event"
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(evt) }}
                          >
                            <strong className="calendar-wtl-event-title">{evt.title}</strong>
                            {height >= 36 && (
                              <span className="calendar-wtl-event-time">{evt.startTime}{evt.endTime ? ` – ${evt.endTime}` : ''}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* 현재 시간 선 */}
              {isCurrentWeek && (
                <div className="calendar-wtl-now-line" style={{ top: `${currentTimeMinutes * (HOUR_HEIGHT / 60)}px` }}>
                  <span className="calendar-wtl-now-dot" />
                </div>
              )}
            </div>
          </div>
        </div>

      /* ── 일간 타임라인 ── */
      ) : (
        <div className="calendar-day-view">
          <div className="calendar-day-allday-row">
            <span className="calendar-day-allday-label">종일</span>
            <div className="calendar-day-allday-events">
              {allDayDayEvents.length > 0 ? (
                allDayDayEvents.map((e) => (
                  <button key={e.id} type="button" className="calendar-event-chip calendar-day-allday-chip" onClick={() => handleOpenEditModal(e)}>
                    {e.title}
                  </button>
                ))
              ) : (
                <span className="calendar-day-allday-empty">종일 일정 없음</span>
              )}
              <button type="button" className="calendar-day-add-btn" onClick={() => openEventModal(dayDateKey)} aria-label="일정 추가">
                + 일정 추가
              </button>
            </div>
          </div>

          <div className="calendar-day-timeline" ref={dayTimelineRef}>
            <div className="calendar-day-timeline-inner" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="calendar-day-hour-row" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                  <span className="calendar-day-hour-label">{String(i).padStart(2, '0')}:00</span>
                  <div className="calendar-day-hour-line" />
                </div>
              ))}

              {timedDayEvents.map((evt) => {
                const startMin = timeToMinutes(evt.startTime)
                const endMin = evt.endTime ? timeToMinutes(evt.endTime) : startMin + 60
                const top = startMin * (HOUR_HEIGHT / 60)
                const height = Math.max((endMin - startMin) * (HOUR_HEIGHT / 60), 32)
                return (
                  <button key={evt.id} type="button" className="calendar-day-event" style={{ top: `${top}px`, height: `${height}px` }} onClick={() => handleOpenEditModal(evt)}>
                    <strong className="calendar-day-event-title">{evt.title}</strong>
                    <span className="calendar-day-event-time">{evt.startTime}{evt.endTime ? ` – ${evt.endTime}` : ''}</span>
                    {evt.content && height >= 52 && <span className="calendar-day-event-content">{evt.content}</span>}
                  </button>
                )
              })}

              {isViewingToday && (
                <div className="calendar-day-now-line" style={{ top: `${currentTimeMinutes * (HOUR_HEIGHT / 60)}px` }}>
                  <span className="calendar-day-now-dot" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 상세 패널 (월간 전용) */}
      {viewMode === 'month' && isDetailsOpen && selectedDateKey ? (
        <aside className="calendar-details">
          <div className="calendar-details-header">
            <div>
              <p className="section-kicker">Schedule</p>
              <h3>{selectedDateKey}</h3>
            </div>
            <div className="calendar-details-actions">
              {selectedEvents.length > 0 && (
                <button type="button" className="calendar-details-bulk-delete" onClick={() => void clearDateEvents(selectedDateKey)}>일괄 삭제</button>
              )}
              <button type="button" className="calendar-details-close" onClick={() => setIsDetailsOpen(false)}>닫기</button>
            </div>
          </div>
          {selectedEvents.length > 0 ? (
            <div className="calendar-details-list">
              {selectedEvents.map((event) => (
                <article key={event.id} className="calendar-details-item">
                  <div className="calendar-details-item-header">
                    <button type="button" className="calendar-event-edit-trigger" onClick={() => handleOpenEditModal(event)}>
                      <strong>{event.title}</strong>
                      {!event.allDay && (event.startTime || event.endTime) && (
                        <p className="calendar-details-time">{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</p>
                      )}
                      {event.allDay && <p className="calendar-details-time">하루종일</p>}
                      {event.content && <p className="calendar-details-content">{event.content}</p>}
                    </button>
                    <button type="button" className="calendar-event-delete" onClick={() => void removeCalendarEvent(event.id)} aria-label={`${event.title} 삭제`}>삭제</button>
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

      {/* 등록 모달 */}
      <Modal
        open={isEventModalOpen}
        title={selectedDateKey ? `${selectedDateKey} 일정 등록` : '일정 등록'}
        footer={[
          <Button key="cancel" onClick={() => setIsEventModalOpen(false)} disabled={isSavingEvent}>취소</Button>,
          <Button key="save" type="primary" loading={isSavingEvent} onClick={() => void handleCreateEvent()}>저장</Button>,
        ]}
        onCancel={() => setIsEventModalOpen(false)}
      >
        {renderEventForm(
          eventDraft, setEventDraft,
          eventContent, setEventContent,
          eventAllDay, setEventAllDay,
          eventStartTime, setEventStartTime,
          eventEndTime, setEventEndTime,
          eventErrorMessage,
        )}
      </Modal>

      {/* 수정 모달 */}
      <Modal
        open={editingEvent !== null}
        title="일정 수정"
        footer={[
          <Button key="cancel" onClick={handleCloseEditModal} disabled={isUpdatingEvent}>취소</Button>,
          <Button key="save" type="primary" loading={isUpdatingEvent} disabled={!editTitle.trim()} onClick={() => void handleUpdateEvent()}>저장</Button>,
        ]}
        onCancel={handleCloseEditModal}
      >
        {renderEventForm(
          editTitle, setEditTitle,
          editContent, setEditContent,
          editAllDay, setEditAllDay,
          editStartTime, setEditStartTime,
          editEndTime, setEditEndTime,
          editErrorMessage,
        )}
      </Modal>
    </section>
  )
}

export default CalendarView
