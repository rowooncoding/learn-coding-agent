import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../../shared/config/firebase'

export type CalendarEvent = {
  id: string
  title: string
  content: string
  dateKey: string
  allDay: boolean
  startTime: string
  endTime: string
  createdAt: number
}

type FirestoreCalendarEvent = {
  title: string
  content: string
  dateKey: string
  allDay: boolean
  startTime: string
  endTime: string
  createdAt: number
}

export type NewCalendarEventPayload = {
  title: string
  content: string
  dateKey: string
  allDay: boolean
  startTime: string
  endTime: string
}

const FIRESTORE_TIMEOUT_MS = 10000

const getCalendarEventsCollection = (userId: string) =>
  collection(db, 'users', userId, 'calendarEvents')

const mapFirestoreError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return new Error(
        '캘린더 일정 권한이 없습니다. Firestore Rules에 calendarEvents 경로 권한을 추가해 주세요.',
      )
    }

    if (error.code === 'unauthenticated') {
      return new Error('로그인 인증이 만료되었습니다. 다시 로그인해 주세요.')
    }
  }

  return error
}

const withFirestoreTimeout = async <T>(promise: Promise<T>) =>
  Promise.race<T>([
    promise.catch((error) => {
      throw mapFirestoreError(error)
    }),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            'Firestore 요청이 시간 안에 완료되지 않았습니다. 보안 규칙이나 네트워크 상태를 확인해 주세요.',
          ),
        )
      }, FIRESTORE_TIMEOUT_MS)
    }),
  ])

export const subscribeCalendarEvents = (
  userId: string,
  onChange: (events: CalendarEvent[]) => void,
) =>
  onSnapshot(
    query(getCalendarEventsCollection(userId), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const events = snapshot.docs.map((eventDoc) => {
        const data = eventDoc.data() as FirestoreCalendarEvent

        return {
          id: eventDoc.id,
          title: data.title,
          content: data.content ?? '',
          dateKey: data.dateKey,
          allDay: data.allDay ?? true,
          startTime: data.startTime ?? '',
          endTime: data.endTime ?? '',
          createdAt: data.createdAt,
        }
      })

      onChange(events)
    },
  )

export const createCalendarEvent = async (
  userId: string,
  payload: NewCalendarEventPayload,
) => {
  await withFirestoreTimeout(
    addDoc(getCalendarEventsCollection(userId), {
      ...payload,
      createdAt: Date.now(),
    }),
  )
}

export type UpdateCalendarEventPayload = {
  title: string
  content: string
  allDay: boolean
  startTime: string
  endTime: string
}

export const updateCalendarEvent = async (
  userId: string,
  eventId: string,
  payload: UpdateCalendarEventPayload,
) => {
  await withFirestoreTimeout(
    updateDoc(doc(db, 'users', userId, 'calendarEvents', eventId), {
      ...payload,
    }).catch((error) => {
      throw mapFirestoreError(error)
    }),
  )
}

export const deleteCalendarEvent = async (userId: string, eventId: string) => {
  await withFirestoreTimeout(
    deleteDoc(doc(db, 'users', userId, 'calendarEvents', eventId)).catch((error) => {
      throw mapFirestoreError(error)
    }),
  )
}

export const deleteCalendarEventsByDate = async (
  userId: string,
  events: CalendarEvent[],
) => {
  await withFirestoreTimeout(
    Promise.all(
      events.map((event) =>
        deleteDoc(doc(db, 'users', userId, 'calendarEvents', event.id)).catch((error) => {
          throw mapFirestoreError(error)
        }),
      ),
    ),
  )
}
