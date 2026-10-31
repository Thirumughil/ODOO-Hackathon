import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Repeat,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  Download,
  Briefcase,
  User,
  ShieldCheck,
} from 'lucide-react'

import DashboardLayout from '../../layouts/DashboardLayout'
import type { UserRole } from '../../components/layout/DashboardSidebar'
import PlaceholderView from '../../components/layout/PlaceholderView'
import './AdminDashboard.css'

import type { UserProfile } from '../../services/authService'

interface AdminDashboardProps {
  userRole?: UserRole
  currentUser?: UserProfile | null
  onLogout?: () => void
}

const previewMetrics = [
  {
    title: 'Total Customers',
    value: '—',
    change: 'API integration pending',
    icon: Users,
  },
  {
    title: 'Active Subscriptions',
    value: '—',
    change: 'API integration pending',
    icon: Repeat,
  },
  {
    title: 'Monthly Revenue',
    value: '—',
    change: 'API integration pending',
    icon: Wallet,
  },
  {
    title: 'Revenue Growth',
    value: '—',
    change: 'API integration pending',
    icon: TrendingUp,
  },
]

const activities = [
  {
    title: 'Customer registration',
    description: 'Recent customer activity will appear here.',
    time: 'Waiting for API',
    icon: Users,
  },
  {
    title: 'Subscription update',
    description: 'Subscription events will appear here.',
    time: 'Waiting for API',
    icon: Repeat,
  },
  {
    title: 'Payment received',
    description: 'Payment events will appear here.',
    time: 'Waiting for API',
    icon: CircleCheck,
  },
  {
    title: 'Invoice generated',
    description: 'Invoice events will appear here.',
    time: 'Waiting for API',
    icon: Clock3,
  },
]

function AdminDashboard({ userRole = 'ADMIN', currentUser, onLogout }: AdminDashboardProps) {
  const [activeItem, setActiveItem] = useState('Overview')
  const [role, setRole] = useState<UserRole>(userRole)

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setActiveItem('Overview')
  }

  const roleMeta: Record<UserRole, { name: string; email: string; subtitle: string }> = {
    ADMIN: {
      name: currentUser && currentUser.role === 'ADMIN' ? currentUser.name : 'System Administrator',
      email: currentUser && currentUser.role === 'ADMIN' ? currentUser.email : 'admin@subscriptiq.io',
      subtitle: 'Monitor and manage entire subscription business',
    },
    STAFF: {
      name: currentUser && currentUser.role === 'STAFF' ? currentUser.name : 'Staff Operations',
      email: currentUser && currentUser.role === 'STAFF' ? currentUser.email : 'staff@subscriptiq.io',
      subtitle: 'Manage daily subscription and billing operations',
    },
    CUSTOMER: {
      name: currentUser && currentUser.role === 'CUSTOMER' ? currentUser.name : 'Acme Corp Customer',
      email: currentUser && currentUser.role === 'CUSTOMER' ? currentUser.email : 'customer@company.com',
      subtitle: 'Self-service customer portal & subscription management',
    },
  }

  const currentMeta = roleMeta[role]

  return (
    <DashboardLayout
      role={role}
      title={activeItem}
      subtitle={currentMeta.subtitle}
      userName={currentMeta.name}
      userEmail={currentMeta.email}
      activeItem={activeItem}
      onNavigate={(item) => setActiveItem(item)}
      onLogout={onLogout}
    >
      {/* Workspace Perspective Bar with Animated Toggle Effect */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          marginBottom: '20px',
        }}
      >
        {userRole === 'ADMIN' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                ADMIN CONSOLE — WORKSPACE PERSPECTIVE:
              </span>
            </div>

            <div className="role-toggle-group" style={{ padding: '3px' }}>
              {(['ADMIN', 'STAFF', 'CUSTOMER'] as UserRole[]).map((r) => {
                const isSelected = role === r
                return (
                  <button
                    key={r}
                    data-role-switcher={r}
                    type="button"
                    className={`role-toggle-option ${isSelected ? 'active' : ''}`}
                    onClick={() => handleRoleChange(r)}
                    style={{ padding: '6px 14px', fontSize: '11px' }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="adminPerspectiveToggle"
                        className="role-toggle-slider"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="role-toggle-text">
                      {r === 'ADMIN' && '👑 Admin'}
                      {r === 'STAFF' && '💼 Staff'}
                      {r === 'CUSTOMER' && '👤 Customer'}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {userRole === 'STAFF' ? (
                <Briefcase size={16} color="var(--brand-primary)" />
              ) : (
                <User size={16} color="var(--brand-primary)" />
              )}
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                LOGGED IN AS: {userRole === 'STAFF' ? 'Staff Operations Member' : 'Customer Account (Acme Corp)'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {userRole === 'STAFF' ? 'Scoped to operational billing actions' : 'Scoped to customer self-service actions'}
            </span>
          </div>
        )}
      </div>

      {activeItem === 'Overview' ? (
        <div className="admin-dashboard">
          <section className="dashboard-welcome">
            <div>
              <span className="welcome-label">{role} WORKSPACE</span>
              <h2>Welcome back, {role === 'ADMIN' ? 'Admin' : role === 'STAFF' ? 'Staff' : 'Customer'} 👋</h2>
              <p>
                {role === 'ADMIN'
                  ? "Here's an overview of your subscription management platform."
                  : role === 'STAFF'
                  ? "Here's your operational workspace for subscriptions and customers."
                  : "Manage your active subscriptions, invoices, and billing details."}
              </p>
            </div>

            <div className="welcome-actions">
              <button type="button" className="dashboard-secondary-button">
                <Download size={16} />
                Export
              </button>

              <button type="button" className="dashboard-primary-button">
                <Plus size={17} />
                {role === 'CUSTOMER' ? 'Browse Plans' : 'Create New'}
              </button>
            </div>
          </section>

          <section className="preview-notice">
            <AlertCircle size={18} />
            <div>
              <strong>Dashboard preview mode</strong>
              <p>
                Live business metrics will appear after backend API integration.
                No sample business data is being displayed.
              </p>
            </div>
          </section>

          <section className="dashboard-metrics">
            {previewMetrics.map((metric) => {
              const Icon = metric.icon

              return (
                <article className="metric-card" key={metric.title}>
                  <div className="metric-card-top">
                    <span>{metric.title}</span>
                    <div className="metric-icon">
                      <Icon size={19} />
                    </div>
                  </div>

                  <h3>{metric.value}</h3>

                  <div className="metric-card-bottom">
                    <Activity size={14} />
                    <span>{metric.change}</span>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-panel revenue-panel">
              <div className="panel-heading">
                <div>
                  <h3>Revenue Overview</h3>
                  <p>Subscription revenue performance</p>
                </div>

                <span className="panel-period">Monthly</span>
              </div>

              <div className="chart-empty-state">
                <div className="chart-placeholder-icon">
                  <TrendingUp size={28} />
                </div>

                <h4>Revenue analytics coming soon</h4>

                <p>
                  Revenue charts will be generated using actual invoice and
                  payment records from the backend.
                </p>
              </div>
            </article>

            <article className="dashboard-panel subscription-panel">
              <div className="panel-heading">
                <div>
                  <h3>Subscription Status</h3>
                  <p>Current subscription distribution</p>
                </div>
              </div>

              <div className="chart-empty-state">
                <div className="chart-placeholder-icon">
                  <Repeat size={28} />
                </div>

                <h4>Subscription data unavailable</h4>

                <p>
                  Status distribution will appear once subscription records
                  are connected.
                </p>
              </div>
            </article>
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Activity</h3>
                <p>Latest events across your platform</p>
              </div>

              <button type="button" className="panel-view-button">
                View all
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="activity-list">
              {activities.map((activity) => {
                const Icon = activity.icon

                return (
                  <div className="activity-item" key={activity.title}>
                    <div className="activity-icon">
                      <Icon size={17} />
                    </div>

                    <div className="activity-description">
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </div>

                    <span className="activity-time">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ) : (
        <PlaceholderView title={activeItem} role={role} />
      )}
    </DashboardLayout>
  )
}

export default AdminDashboard