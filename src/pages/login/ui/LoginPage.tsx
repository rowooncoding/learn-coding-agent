import { Alert, Button, Divider, Input } from 'antd'
import { useState } from 'react'
import { useAuth } from '../../../shared/auth/model/AuthProvider'

function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    try {
      setErrorMessage('')
      setIsSubmitting(true)
      await signInWithGoogle()
    } catch {
      setErrorMessage('Google 로그인에 실패했습니다. Firebase Auth 설정을 확인해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailAuth = async (mode: 'sign-in' | 'sign-up') => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    try {
      setErrorMessage('')
      setIsSubmitting(true)

      if (mode === 'sign-in') {
        await signInWithEmail(normalizedEmail, password)
      } else {
        await signUpWithEmail(normalizedEmail, password)
      }
    } catch {
      setErrorMessage(
        mode === 'sign-in'
          ? '이메일 로그인에 실패했습니다. 계정 정보와 Firebase Auth 설정을 확인해 주세요.'
          : '회원가입에 실패했습니다. Email/Password 제공자가 켜져 있는지 확인해 주세요.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <p className="eyebrow">PERSONAL TODO WEB</p>
        <h1>로그인하고 시작하기</h1>
        <p className="login-copy">
          Google 계정으로 로그인하면 할 일과 캘린더를 같은 데이터로 관리할 수
          있습니다.
        </p>

        <div className="login-form">
          <label className="login-label" htmlFor="email">
            이메일
          </label>
          <Input
            id="email"
            className="login-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label className="login-label" htmlFor="password">
            비밀번호
          </label>
          <Input.Password
            id="password"
            className="login-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
          />

          <div className="login-actions">
            <Button
              onClick={() => void handleEmailAuth('sign-in')}
              disabled={isSubmitting}
              size="large"
            >
              이메일 로그인
            </Button>
            <Button
              onClick={() => void handleEmailAuth('sign-up')}
              disabled={isSubmitting}
              size="large"
            >
              회원가입
            </Button>
          </div>
        </div>

        <Divider className="login-divider">또는</Divider>

        <Button
          type="primary"
          size="large"
          className="login-button"
          onClick={handleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : 'Google로 로그인'}
        </Button>

        {errorMessage ? (
          <Alert
            className="login-error"
            type="error"
            message={errorMessage}
            showIcon
          />
        ) : null}
      </section>
    </main>
  )
}

export default LoginPage
