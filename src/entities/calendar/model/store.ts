import { create } from 'zustand'
import {
  createCalendarEvent,
  subscribeCalendarEvents,
  type CalendarEvent,
} from '../api/events'

type CalendarStore = {
  events: CalendarEvent[]
  selectedDateKey: string | null
  eventDraft: string
  isLoading: boolean
  userId: string | null
  setSelectedDateKey: (dateKey: string | null) => void
  setEventDraft: (draft: string) => void
  setUserId: (userId: string | null) => void
  resetCalendar: () => void
  startCalendarSubscription: (userId: string) => () => void
  addCalendarEvent: () => Promise<void>
}

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  events: [],
  selectedDateKey: null,
  eventDraft: '',
  isLoading: false,
  userId: null,
  setSelectedDateKey: (selectedDateKey) => set({ selectedDateKey }),
  setEventDraft: (eventDraft) => set({ eventDraft }),
  setUserId: (userId) => set({ userId }),
  resetCalendar: () =>
    set({
      events: [],
      selectedDateKey: null,
      eventDraft: '',
      isLoading: false,
      userId: null,
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
    const { eventDraft, selectedDateKey, userId } = get()
    const title = eventDraft.trim()

    if (!title || !selectedDateKey || !userId) {
      return
    }

    await createCalendarEvent(userId, title, selectedDateKey)
    set({ eventDraft: '' })
  },
}))
