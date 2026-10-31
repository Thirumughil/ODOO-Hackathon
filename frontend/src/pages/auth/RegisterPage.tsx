import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  UserPlus,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Loader2,
} from 'lucide-react'

import ThemeToggle from '../../components/common/ThemeToggle'
import { authService, type UserProfile } from '../../services/authService'
import '../../App.css'

interface RegisterPageProps {
  onNavigate?: (page: 'login') => void
}

function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null)

  const passwordValid =
    password.length >= 9 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!passwordValid) {
      setErrorMessage(
        'Password must contain at least 9 characters, an uppercase letter, a lowercase letter and a special character.'
      )
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setErrorMessage('Please accept the Terms and Conditions.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      setRegisteredUser(response.user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-container">
      <section className="auth-panel">
        <div className="auth-top" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="back-link"
            onClick={() => onNavigate?.('login')}
          >
            <ArrowLeft size={15} />
            Back to login
          </button>

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

          <h1>Create your account</h1>
          <p className="auth-subtitle">
            Get started with smarter subscription management.
          </p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="auth-subtitle" style={{ fontSize: '11px', marginTop: '7px' }}>
                Minimum 9 characters, uppercase, lowercase and special character.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>

              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <label className="remember-option" style={{ margin: '12px 0 18px' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>I agree to the Terms and Conditions.</span>
            </label>

            {registeredUser ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  marginTop: '16px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: '#10b981',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 600 }}>
                  Account Created Successfully!
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', opacity: 0.85, lineHeight: 1.5 }}>
                  Welcome, <strong>{registeredUser.name}</strong>. Your account has been registered with role <strong>CUSTOMER</strong>. You can now sign in to access your subscriptions.
                </p>
                <button
                  type="button"
                  className="login-button"
                  onClick={() => onNavigate?.('login')}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  className="login-button"
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isLoading ? 0.75 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {errorMessage && (
                  <div
                    className="status-message"
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#ef4444',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginTop: '14px',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </>
            )}
          </form>

          {!registeredUser && (
            <p className="register-text">
              Already have an account?
              <button
                type="button"
                className="register-link"
                onClick={() => onNavigate?.('login')}
              >
                {' '}Sign in
              </button>
            </p>
          )}
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
              YOUR BUSINESS. ONE SMART PLATFORM.
            </span>

            <h2>
              Start smarter.
              <br />
              <span>Scale faster.</span>
            </h2>

            <p>
              Create your account and discover a simpler way to manage
              subscriptions, recurring billing and business revenue.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <UserPlus size={19} />
              </div>
              <div>
                <h3>Simple Account Setup</h3>
                <p>Get started with a straightforward registration process.</p>
              </div>
              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <CreditCard size={19} />
              </div>
              <div>
                <h3>Subscription Management</h3>
                <p>Organize plans, billing and payments in one place.</p>
              </div>
              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h3>Secure Account Access</h3>
                <p>Your account is protected by secure authentication.</p>
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

export default RegisterPage