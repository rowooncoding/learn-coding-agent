import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../widgets/app-layout/ui/AppLayout'
import CalendarPage from '../pages/calendar/ui/CalendarPage'
import HomePage from '../pages/home/ui/HomePage'
import './styles/app.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
