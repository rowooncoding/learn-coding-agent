import { App as AntApp, ConfigProvider } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../widgets/app-layout/ui/AppLayout'
import CalendarPage from '../pages/calendar/ui/CalendarPage'
import HomePage from '../pages/home/ui/HomePage'
import LoginPage from '../pages/login/ui/LoginPage'
import { AuthProvider } from '../shared/auth/model/AuthProvider'
import ProtectedRoute from '../shared/auth/ui/ProtectedRoute'
import PublicOnlyRoute from '../shared/auth/ui/PublicOnlyRoute'
import './styles/app.css'

function App() {
  return (
    <AuthProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2563eb',
            borderRadius: 16,
            fontFamily: "'Satoshi', 'Pretendard', 'Noto Sans KR', sans-serif",
          },
        }}
      >
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicOnlyRoute />}>
                <Route path="/" element={<LoginPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/todo" element={<HomePage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </AuthProvider>
  )
}

export default App
