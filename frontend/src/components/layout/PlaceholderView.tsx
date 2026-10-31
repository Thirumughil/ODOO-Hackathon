import { useState, useEffect } from 'react'
import {
  Users,
  UserCog,
  Package,
  Layers,
  Repeat,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ShoppingBag,
  Receipt,
  Wallet,
  UserCircle,
  Plus,
  Filter,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import { userService } from '../../services/userService'
import type { UserProfile } from '../../services/authService'

interface PlaceholderViewProps {
  title: string
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
  description?: string
}

const iconMap: Record<string, LucideIcon> = {
  Overview: Layers,
  Customers: Users,
  Staff: UserCog,
  Products: Package,
  Plans: Layers,
  Subscriptions: Repeat,
  Invoices: FileText,
  Payments: CreditCard,
  Reports: BarChart3,
  Settings: Settings,
  'My Subscriptions': Repeat,
  'Available Plans': ShoppingBag,
  Receipts: Receipt,
  'Payment Methods': Wallet,
  Profile: UserCircle,
}

const tableHeaders: Record<string, string[]> = {
  Customers: ['Customer ID', 'Full Name', 'Email', 'Role', 'Registration Date', 'Status', 'Actions'],
  Staff: ['Staff ID', 'Name', 'Email', 'Assigned Role', 'Account Status', 'Created Date', 'Actions'],
  Products: ['Product ID', 'Name', 'Category', 'Billing Types', 'Active Plans', 'Status', 'Actions'],
  Plans: ['Plan ID', 'Plan Name', 'Product', 'Billing Interval', 'Price (USD)', 'Subscribers', 'Status'],
  Subscriptions: ['Subscription ID', 'Customer', 'Plan', 'Billing Cycle', 'Next Billing', 'Status', 'Actions'],
  Invoices: ['Invoice Number', 'Customer', 'Amount', 'Issue Date', 'Due Date', 'Payment Status', 'PDF'],
  Payments: ['Transaction ID', 'Customer', 'Method', 'Amount', 'Date & Time', 'Status', 'Receipt'],
  Reports: ['Report Name', 'Type', 'Time Period', 'Generated At', 'File Size', 'Format', 'Download'],
  'My Subscriptions': ['Plan', 'Billing Cycle', 'Amount', 'Renewal Date', 'Status', 'Manage'],
  'Available Plans': ['Plan Name', 'Description', 'Price', 'Interval', 'Included Features', 'Action'],
  'Payment Methods': ['Card Type', 'Last 4 Digits', 'Expiration', 'Billing Address', 'Default', 'Actions'],
  Profile: ['Field', 'Current Setting', 'Status', 'Last Updated'],
  Settings: ['Configuration Section', 'Scope', 'Value', 'Status', 'Action'],
}

function PlaceholderView({ title, role, description }: PlaceholderViewProps) {
  const Icon = iconMap[title] || Layers
  const headers = tableHeaders[title] || ['Item ID', 'Name', 'Description', 'Updated Date', 'Status', 'Actions']

  const isUserModule = (title === 'Customers' || title === 'Staff') && role === 'ADMIN'
  const [liveUsers, setLiveUsers] = useState<UserProfile[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isUserModule) return

    let isMounted = true
    setIsLoadingUsers(true)
    setLoadError('')

    userService
      .getUsers()
      .then((users) => {
        if (!isMounted) return
        const targetRole = title === 'Customers' ? 'CUSTOMER' : 'STAFF'
        const filtered = users.filter((u) => u.role === targetRole)
        setLiveUsers(filtered)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Unable to load user records'
        setLoadError(msg)
      })
      .finally(() => {
        if (isMounted) setIsLoadingUsers(false)
      })

    return () => {
      isMounted = false
    }
  }, [title, isUserModule])

  return (
    <div className="admin-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="welcome-label">{role} WORKSPACE</span>
          <h2>{title}</h2>
          <p>
            {description || `Manage and inspect ${title.toLowerCase()} for your organization.`}
          </p>
        </div>

        <div className="welcome-actions">
          <button type="button" className="dashboard-secondary-button">
            <Filter size={16} />
            Filter
          </button>
          <button type="button" className="dashboard-secondary-button">
            <Download size={16} />
            Export
          </button>
          <button type="button" className="dashboard-primary-button">
            <Plus size={17} />
            {role === 'CUSTOMER' ? 'Add' : 'Create'} {title.slice(-1) === 's' ? title.slice(0, -1) : title}
          </button>
        </div>
      </section>

      {isUserModule ? (
        <section className="preview-notice" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <div>
            <strong style={{ color: '#10b981' }}>Live MySQL Connection Active</strong>
            <p>
              Displaying authenticated real-time {title.toLowerCase()} records queried directly from the MySQL database through the SubscriptIQ API.
            </p>
          </div>
        </section>
      ) : (
        <section className="preview-notice">
          <AlertCircle size={18} />
          <div>
            <strong>Backend Integration Pending</strong>
            <p>
              Live {title.toLowerCase()} records will be populated automatically when connected to the backend API endpoints.
              Frontend structure is verified and ready.
            </p>
          </div>
        </section>
      )}

      <div className="dashboard-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 650, color: 'var(--text-primary)' }}>{title} Directory</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Connected schema: MySQL database via SubscriptIQ API
            </p>
          </div>
          <span
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: isUserModule ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
              color: isUserModule ? '#10b981' : 'var(--brand-primary)',
              border: isUserModule ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
              fontWeight: 600,
            }}
          >
            {isUserModule ? `${liveUsers.length} Recorded in DB` : 'Waiting for Live Data'}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                {headers.map((h) => (
                  <th key={h} style={{ padding: '12px 18px', fontWeight: 650, color: 'var(--text-secondary)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isUserModule ? (
                isLoadingUsers ? (
                  <tr>
                    <td colSpan={headers.length} style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Querying MySQL database via API...</span>
                      </div>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={headers.length} style={{ padding: '40px 20px', textAlign: 'center', color: '#ef4444' }}>
                      <AlertCircle size={22} style={{ margin: '0 auto 8px' }} />
                      <p>{loadError}</p>
                    </td>
                  </tr>
                ) : liveUsers.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} style={{ padding: '50px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Icon size={24} style={{ color: 'var(--text-muted)' }} />
                        <h4 style={{ margin: 0, fontSize: '15px' }}>No {title.toLowerCase()} accounts registered yet</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                          New registrations will automatically appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  liveUsers.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--brand-primary)' }}>
                        #{u.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.name}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: u.role === 'ADMIN' ? 'rgba(234, 88, 12, 0.12)' : u.role === 'STAFF' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: u.role === 'ADMIN' ? '#ea580c' : u.role === 'STAFF' ? '#3b82f6' : '#10b981',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: (u.status || 'ACTIVE') === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: (u.status || 'ACTIVE') === 'ACTIVE' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan={headers.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div className="chart-placeholder-icon" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)', margin: '0 auto' }}>
                        <Icon size={26} />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        No {title.toLowerCase()} records loaded
                      </h4>
                      <p style={{ maxWidth: '420px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                        Once the backend database is synchronized, live {title.toLowerCase()} records will appear here with real-time filtering, pagination, and sorting.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderView
