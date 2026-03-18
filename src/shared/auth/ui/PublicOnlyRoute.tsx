import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../model/AuthProvider'

function PublicOnlyRoute() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return <div className="auth-loading">로그인 상태를 확인하는 중입니다.</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
