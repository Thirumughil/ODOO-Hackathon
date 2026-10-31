import { useState } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'

import ThemeToggle from '../common/ThemeToggle'
import type { UserRole } from './DashboardSidebar'

import './DashboardTopbar.css'

interface DashboardTopbarProps {
  title: string
  subtitle?: string
  userName: string
  userEmail: string
  role: UserRole
  onLogout?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onMenuClick?: () => void
}

function DashboardTopbar({
  title,
  subtitle,
  userName,
  userEmail,
  role,
  onLogout,
  onProfileClick,
  onSettingsClick,
  onMenuClick,
}: DashboardTopbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const roleLabel: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff Member',
    CUSTOMER: 'Customer',
  }

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="dashboard-topbar">

      <div className="topbar-left">

        <button
          className="topbar-mobile-menu"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>

        <div className="topbar-heading">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

      </div>

      <div className="topbar-right">

        <div className="topbar-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search"
          />

          <kbd>⌘ K</kbd>
        </div>

        <ThemeToggle />

        <div className="topbar-dropdown-wrapper">

          <button
            className={`topbar-icon-button ${notificationsOpen ? 'selected' : ''}`}
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen)
              setProfileOpen(false)
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="notification-indicator" />
          </button>

          {notificationsOpen && (
            <div className="topbar-dropdown notification-dropdown">
              <div className="dropdown-heading">
                <h3>Notifications</h3>
                <span>Recent activity</span>
              </div>

              <div className="notification-empty">
                <Bell size={23} />
                <p>You're all caught up!</p>
                <span>No new notifications.</span>
              </div>
            </div>
          )}

        </div>

        <div className="topbar-divider" />

        <div className="topbar-dropdown-wrapper">

          <button
            className="topbar-profile-button"
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen)
              setNotificationsOpen(false)
            }}
            aria-expanded={profileOpen}
          >
            <div className="topbar-avatar">{initials || 'U'}</div>

            <div className="topbar-user-info">
              <span className="topbar-user-name">{userName}</span>
              <span className="topbar-user-role">{roleLabel[role]}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">

              <div className="profile-dropdown-header">
                <strong>{userName}</strong>
                <span>{userEmail}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onProfileClick?.()
                  setProfileOpen(false)
                }}
              >
                <UserCircle size={17} />
                My Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  onSettingsClick?.()
                  setProfileOpen(false)
                }}
              >
                <Settings size={17} />
                Settings
              </button>

              {onLogout && (
                <button
                  type="button"
                  className="dropdown-logout"
                  onClick={onLogout}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              )}

            </div>
          )}

        </div>

      </div>

    </header>
  )
}

export default DashboardTopbar