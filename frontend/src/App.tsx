import { useState, useEffect } from 'react'
import AdminDashboard from './pages/admin/AdminDashboard'
import LoginPage, { type LoginRole } from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import { authService, type UserProfile } from './services/authService'

type AuthPage = 'login' | 'register' | 'forgot-password'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<LoginRole>('ADMIN')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authPage, setAuthPage] = useState<AuthPage>('login')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = authService.getToken()
      const storedUser = authService.getStoredUser()

      if (storedToken && storedUser) {
        setUserRole(storedUser.role as LoginRole)
        setCurrentUser(storedUser)
        setIsLoggedIn(true)

        // Validate token with backend /api/auth/me
        try {
          const freshUser = await authService.fetchCurrentUser()
          if (freshUser) {
            setCurrentUser(freshUser)
            setUserRole(freshUser.role as LoginRole)
          } else {
            // Token expired or invalid
            setIsLoggedIn(false)
            setCurrentUser(null)
          }
        } catch {
          setIsLoggedIn(false)
          setCurrentUser(null)
        }
      }
      setIsCheckingAuth(false)
    }

    restoreSession()
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setAuthPage('login')
  }

  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-main, #0f172a)',
          color: '#94a3b8',
          fontSize: '14px',
        }}
      >
        <span>Verifying SubscriptIQ session...</span>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <AdminDashboard
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    )
  }

  if (authPage === 'register') {
    return (
      <RegisterPage
        onNavigate={() => setAuthPage('login')}
      />
    )
  }

  if (authPage === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigate={() => setAuthPage('login')}
      />
    )
  }

  return (
    <LoginPage
      onLogin={(role, user) => {
        setUserRole(role)
        setCurrentUser(user)
        setIsLoggedIn(true)
      }}
      onNavigate={(page) => {
        if (page === 'register') {
          setAuthPage('register')
        } else if (page === 'forgot-password') {
          setAuthPage('forgot-password')
        }
      }}
    />
  )
}

export default App