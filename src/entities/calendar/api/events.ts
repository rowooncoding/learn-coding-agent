import { FirebaseError } from 'firebase/app'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../../../shared/config/firebase'

export type CalendarEvent = {
  id: string
  title: string
  dateKey: string
  createdAt: number
}

type FirestoreCalendarEvent = {
  title: string
  dateKey: string
  createdAt: number
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
          dateKey: data.dateKey,
          createdAt: data.createdAt,
        }
      })

      onChange(events)
    },
  )

export const createCalendarEvent = async (
  userId: string,
  title: string,
  dateKey: string,
) => {
  await withFirestoreTimeout(
    addDoc(getCalendarEventsCollection(userId), {
      title,
      dateKey,
      createdAt: Date.now(),
    }),
  )
}
