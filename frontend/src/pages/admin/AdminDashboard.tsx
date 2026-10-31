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
} from 'lucide-react'

import DashboardLayout from '../../layouts/DashboardLayout'
import './AdminDashboard.css'

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

function AdminDashboard() {
  return (
    <DashboardLayout
      role="ADMIN"
      title="Overview"
      subtitle="Monitor your subscription business"
      userName="Admin Preview"
      userEmail="admin-preview@subscriptiq.local"
      activeItem="Overview"
      onNavigate={(item) => console.log('Navigation selected:', item)}
      onLogout={() => console.log('Logout selected')}
    >
      <div className="admin-dashboard">

        <section className="dashboard-welcome">
          <div>
            <span className="welcome-label">ADMIN WORKSPACE</span>
            <h2>Welcome back, Admin 👋</h2>
            <p>
              Here's an overview of your subscription management platform.
            </p>
          </div>

          <div className="welcome-actions">
            <button type="button" className="dashboard-secondary-button">
              <Download size={16} />
              Export
            </button>

            <button type="button" className="dashboard-primary-button">
              <Plus size={17} />
              Create New
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
    </DashboardLayout>
  )
}

export default AdminDashboard