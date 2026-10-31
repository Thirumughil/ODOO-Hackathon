import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  KeyRound,
  ShieldCheck,
  MailCheck,
  Check,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react'

import ThemeToggle from '../../components/common/ThemeToggle'
import { authService } from '../../services/authService'
import '../../App.css'

interface ForgotPasswordPageProps {
  onNavigate?: (page: 'login') => void
}

function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage('')
    setIsSuccess(false)

    if (!email.trim()) {
      setStatusMessage('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email.trim().toLowerCase())
      setIsSuccess(true)
      setStatusMessage(
        `${response.message}. (Note: SMTP service is not configured in this local environment; password reset tokens are safely recorded in the database without external mail delivery).`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit password reset request.'
      setStatusMessage(msg)
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

          <h1>Reset password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleResetRequest}>
            <div className="form-group">
              <label htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
              style={{
                marginTop: '10px',
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
                  Sending Request...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {statusMessage && (
              <div
                className="status-message"
                role="status"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: isSuccess ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: isSuccess ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: isSuccess ? '#3b82f6' : '#ef4444',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginTop: '14px',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  textAlign: 'left',
                }}
              >
                {isSuccess ? (
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
          </form>

          <p className="register-text">
            Remember your password?
            <button
              type="button"
              className="register-link"
              onClick={() => onNavigate?.('login')}
            >
              {' '}Back to Sign in
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
              ACCOUNT SECURITY & RECOVERY
            </span>

            <h2>
              Recover your access.
              <br />
              <span>Continue growing.</span>
            </h2>

            <p>
              SubscriptIQ uses role-based security to ensure your business and
              customer billing data remains completely protected.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <KeyRound size={19} />
              </div>
              <div>
                <h3>Secure Password Reset</h3>
                <p>Protected recovery links verified against your registered email.</p>
              </div>
              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h3>Zero Credential Leakage</h3>
                <p>Passwords are never stored in plaintext or exposed over API.</p>
              </div>
              <Check className="feature-check" size={17} />
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <MailCheck size={19} />
              </div>
              <div>
                <h3>Verified Delivery</h3>
                <p>Expiring reset tokens ensure unauthorized access is blocked.</p>
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

export default ForgotPasswordPage
