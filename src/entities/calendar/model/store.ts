import { create } from 'zustand'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  deleteCalendarEventsByDate,
  subscribeCalendarEvents,
  updateCalendarEvent,
  type CalendarEvent,
  type UpdateCalendarEventPayload,
} from '../api/events'

type CalendarStore = {
  events: CalendarEvent[]
  selectedDateKey: string | null
  eventDraft: string
  eventContent: string
  eventAllDay: boolean
  eventStartTime: string
  eventEndTime: string
  isLoading: boolean
  userId: string | null
  setSelectedDateKey: (dateKey: string | null) => void
  setEventDraft: (draft: string) => void
  setEventContent: (content: string) => void
  setEventAllDay: (allDay: boolean) => void
  setEventStartTime: (time: string) => void
  setEventEndTime: (time: string) => void
  setUserId: (userId: string | null) => void
  resetCalendar: () => void
  resetEventForm: () => void
  startCalendarSubscription: (userId: string) => () => void
  addCalendarEvent: () => Promise<void>
  removeCalendarEvent: (eventId: string) => Promise<void>
  clearDateEvents: (dateKey: string) => Promise<void>
  editCalendarEvent: (eventId: string, payload: UpdateCalendarEventPayload) => Promise<void>
}

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  events: [],
  selectedDateKey: null,
  eventDraft: '',
  eventContent: '',
  eventAllDay: true,
  eventStartTime: '',
  eventEndTime: '',
  isLoading: false,
  userId: null,
  setSelectedDateKey: (selectedDateKey) => set({ selectedDateKey }),
  setEventDraft: (eventDraft) => set({ eventDraft }),
  setEventContent: (eventContent) => set({ eventContent }),
  setEventAllDay: (eventAllDay) => set({ eventAllDay }),
  setEventStartTime: (eventStartTime) => set({ eventStartTime }),
  setEventEndTime: (eventEndTime) => set({ eventEndTime }),
  setUserId: (userId) => set({ userId }),
  resetCalendar: () =>
    set({
      events: [],
      selectedDateKey: null,
      eventDraft: '',
      eventContent: '',
      eventAllDay: true,
      eventStartTime: '',
      eventEndTime: '',
      isLoading: false,
      userId: null,
    }),
  resetEventForm: () =>
    set({
      eventDraft: '',
      eventContent: '',
      eventAllDay: true,
      eventStartTime: '',
      eventEndTime: '',
    }),
  startCalendarSubscription: (userId) => {
    set({ isLoading: true, userId })

    return subscribeCalendarEvents(userId, (events) => {
      set({
        events,
        isLoading: false,
      })
    })
  },
  addCalendarEvent: async () => {
    const { eventDraft, eventContent, eventAllDay, eventStartTime, eventEndTime, selectedDateKey, userId } = get()
    const title = eventDraft.trim()

    if (!title || !selectedDateKey || !userId) {
      return
    }

    await createCalendarEvent(userId, {
      title,
      content: eventContent.trim(),
      dateKey: selectedDateKey,
      allDay: eventAllDay,
      startTime: eventAllDay ? '' : eventStartTime,
      endTime: eventAllDay ? '' : eventEndTime,
    })
    get().resetEventForm()
  },
  removeCalendarEvent: async (eventId) => {
    const { userId } = get()
    if (!userId) return
    await deleteCalendarEvent(userId, eventId)
  },
  clearDateEvents: async (dateKey) => {
    const { userId, events } = get()
    if (!userId) return
    const targetEvents = events.filter((e) => e.dateKey === dateKey)
    await deleteCalendarEventsByDate(userId, targetEvents)
  },
  editCalendarEvent: async (eventId, payload) => {
    const { userId } = get()
    if (!userId) return
    await updateCalendarEvent(userId, eventId, payload)
  },
}))
