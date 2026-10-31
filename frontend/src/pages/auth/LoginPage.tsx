import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CreditCard,
  ChartNoAxesCombined,
  ShieldCheck,
  Check,
  Briefcase,
  User,
  type LucideIcon,
} from 'lucide-react'

import ThemeToggle from '../../components/common/ThemeToggle'
import authService, { type UserProfile } from '../../services/authService'
import '../../App.css'

export type LoginRole = 'ADMIN' | 'STAFF' | 'CUSTOMER'

interface LoginPageProps {
  onLogin?: (role: LoginRole, user: UserProfile) => void
  onNavigate?: (page: 'register' | 'forgot-password') => void
}

const roleOptions: {
  id: LoginRole
  label: string
  icon: LucideIcon
  subtitle: string
  defaultEmail: string
  defaultPass: string
}[] = [
  {
    id: 'ADMIN',
    label: 'Admin',
    icon: ShieldCheck,
    subtitle: 'Sign in to SubscriptIQ Admin Console',
    defaultEmail: 'admin@subscriptiq.io',
    defaultPass: 'AdminPassword1!',
  },
  {
    id: 'STAFF',
    label: 'Staff',
    icon: Briefcase,
    subtitle: 'Sign in to Staff Operations Workspace',
    defaultEmail: 'staff@subscriptiq.io',
    defaultPass: 'StaffPassword1!',
  },
  {
    id: 'CUSTOMER',
    label: 'Customer',
    icon: User,
    subtitle: 'Sign in to Customer Billing Portal',
    defaultEmail: 'customer@acmecorp.com',
    defaultPass: 'CustomerPassword1!',
  },
]

function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('ADMIN')
  const [email, setEmail] = useState('admin@subscriptiq.io')
  const [password, setPassword] = useState('AdminPassword1!')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role)
    const opt = roleOptions.find((r) => r.id === role)
    if (opt) {
      setEmail(opt.defaultEmail)
      setPassword(opt.defaultPass)
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    try {
      setIsLoading(true)
      const result = await authService.login({ email, password })
      if (onLogin && result.user) {
        onLogin(result.user.role as LoginRole, result.user)
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.'
      setMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRoleOpt = roleOptions.find((r) => r.id === selectedRole) || roleOptions[0]

  return (
    <main className="login-container">

      <section className="auth-panel">

        <div
          className="auth-top"
          style={{ justifyContent: 'space-between' }}
        >
          <a href="#" className="back-link">
            <ArrowLeft size={15} />
            Back to website
          </a>

          <ThemeToggle />
        </div>

        <motion.div
          className="auth-content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          <div className="mobile-logo">
            <div className="logo-icon">
              <Sparkles size={22} />
            </div>

            <span>
              Subscript<span className="logo-highlight">IQ</span>
            </span>
          </div>

          <h1>Welcome back</h1>

          <p className="auth-subtitle">
            {currentRoleOpt.subtitle}
          </p>

          {/* Role Toggle Select Box with Animated Sliding Pill Effect */}
          <div className="login-role-select">
            <span className="login-role-label">CHOOSE LOGIN PORTAL</span>
            <div className="role-toggle-group" role="tablist">
              {roleOptions.map((r) => {
                const isSelected = selectedRole === r.id
                const Icon = r.icon

                return (
                  <button
                    key={r.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`role-toggle-option ${isSelected ? 'active' : ''}`}
                    onClick={() => handleRoleSelect(r.id)}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="loginRolePill"
                        className="role-toggle-slider"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="role-toggle-text">
                      <Icon size={14} />
                      {r.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                  }
                </button>
              </div>
            </div>

            <div className="form-options">

              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-link"
                onClick={() => onNavigate?.('forgot-password')}
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.75 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {message && (
              <p className="status-message" role="status">
                {message}
              </p>
            )}

          </form>

          <p className="register-text">
            Don't have an account?

            <button
              type="button"
              className="register-link"
              onClick={() => onNavigate?.('register')}
            >
              {' '}Create an account
            </button>
          </p>

        </motion.div>

        <footer className="auth-footer">
          © 2026 SubscriptIQ. All rights reserved.
        </footer>

      </section>

      <section className="brand-panel">

        <div className="brand-glow brand-glow-one" />
        <div className="brand-glow brand-glow-two" />

        <motion.div
          className="brand-content"
          initial={{ opacity: 0, x: 35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >

          <div className="brand-logo">
            <div className="brand-logo-icon">
              <Sparkles size={27} />
            </div>

            <span>
              Subscript<span>IQ</span>
            </span>
          </div>

          <div className="brand-description">

            <span className="brand-eyebrow">
              INTELLIGENT SUBSCRIPTION MANAGEMENT
            </span>

            <h2>
              Manage smarter.
              <br />
              <span>Grow faster.</span>
            </h2>

            <p>
              One powerful platform to manage subscriptions,
              automate recurring billing, track revenue, and
              simplify your entire subscription business.
            </p>

          </div>

          <div className="feature-list">

            <div className="feature-item">
              <div className="feature-icon">
                <RefreshCw size={19} />
              </div>

              <div>
                <h3>Automated Subscription Management</h3>
                <p>Manage every subscription from one place.</p>
              </div>

              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <CreditCard size={19} />
              </div>

              <div>
                <h3>Recurring Billing & Invoicing</h3>
                <p>Streamline invoices and payment tracking.</p>
              </div>

              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ChartNoAxesCombined size={19} />
              </div>

              <div>
                <h3>Revenue Intelligence</h3>
                <p>Understand revenue and business performance.</p>
              </div>

              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <h3>Secure Role-Based Access</h3>
                <p>Keep your business data protected.</p>
              </div>

              <Check className="feature-check" size={17} />
            </div>

          </div>

          <div className="brand-bottom">
            <div className="brand-bottom-line" />
            <p>Everything your subscription business needs.</p>
          </div>

        </motion.div>

        <div className="brand-footer">
          <span>Built for modern businesses.</span>
          <span>SUBSCRIPTIONS REIMAGINED.</span>
        </div>

      </section>

    </main>
  )
}

export default LoginPage