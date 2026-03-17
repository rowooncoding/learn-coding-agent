import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../model/AuthProvider'

function ProtectedRoute() {
  const { isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="auth-loading">로그인 상태를 확인하는 중입니다.</div>
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
