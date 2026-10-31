import { useState, type ReactNode } from 'react'
import DashboardSidebar, {
  type UserRole,
} from '../components/layout/DashboardSidebar'
import DashboardTopbar from '../components/layout/DashboardTopbar'
import './DashboardLayout.css'

interface DashboardLayoutProps {
  role: UserRole
  title: string
  subtitle?: string
  userName: string
  userEmail: string
  activeItem: string
  onNavigate: (item: string) => void
  onLogout?: () => void
  children: ReactNode
}

function DashboardLayout({
  role,
  title,
  subtitle,
  userName,
  userEmail,
  activeItem,
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-layout">

      <DashboardSidebar
        role={role}
        activeItem={activeItem}
        onNavigate={(item) => {
          onNavigate(item)
          setMobileOpen(false)
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onLogout={onLogout}
      />

      <div
        className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}
      >

        <DashboardTopbar
          title={title}
          subtitle={subtitle}
          userName={userName}
          userEmail={userEmail}
          role={role}
          onLogout={onLogout}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          {children}
        </main>

      </div>

      {mobileOpen && (
        <button
          type="button"
          className="dashboard-mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {mobileOpen && (
        <div className="dashboard-mobile-sidebar">
          <DashboardSidebar
            role={role}
            activeItem={activeItem}
            onNavigate={(item) => {
              onNavigate(item)
              setMobileOpen(false)
            }}
            onLogout={onLogout}
          />
        </div>
      )}

    </div>
  )
}

export default DashboardLayout