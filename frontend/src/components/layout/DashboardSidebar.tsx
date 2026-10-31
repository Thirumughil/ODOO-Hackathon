import {
  LayoutDashboard,
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
  HelpCircle,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import './DashboardSidebar.css'

export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER'

interface DashboardSidebarProps {
  role: UserRole
  activeItem: string
  onNavigate: (item: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onLogout?: () => void
}

const navigation: Record<
  UserRole,
  { label: string; icon: typeof LayoutDashboard }[]
> = {
  ADMIN: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Customers', icon: Users },
    { label: 'Staff', icon: UserCog },
    { label: 'Products', icon: Package },
    { label: 'Plans', icon: Layers },
    { label: 'Subscriptions', icon: Repeat },
    { label: 'Invoices', icon: FileText },
    { label: 'Payments', icon: CreditCard },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Settings', icon: Settings },
  ],

  STAFF: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Customers', icon: Users },
    { label: 'Products', icon: Package },
    { label: 'Plans', icon: Layers },
    { label: 'Subscriptions', icon: Repeat },
    { label: 'Invoices', icon: FileText },
    { label: 'Payments', icon: CreditCard },
  ],

  CUSTOMER: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'My Subscriptions', icon: Repeat },
    { label: 'Available Plans', icon: ShoppingBag },
    { label: 'Invoices', icon: Receipt },
    { label: 'Payment Methods', icon: Wallet },
    { label: 'Profile', icon: UserCircle },
  ],
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  STAFF: 'Staff Workspace',
  CUSTOMER: 'Customer Portal',
}

function DashboardSidebar({
  role,
  activeItem,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onLogout,
}: DashboardSidebarProps) {
  const menuItems = navigation[role]

  return (
    <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>

      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Sparkles size={22} />
        </div>

        {!collapsed && (
          <div className="sidebar-brand-text">
            <h2>SubscriptIQ</h2>
            <span>SMART REVENUE PLATFORM</span>
          </div>
        )}
      </div>

      <div className="sidebar-role">
        {!collapsed && (
          <>
            <span className="sidebar-role-label">WORKSPACE</span>
            <span className="sidebar-role-name">{roleLabels[role]}</span>
          </>
        )}
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        {!collapsed && <span className="sidebar-section-label">MENU</span>}

        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.label

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.label)}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />

              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-nav-item"
          title={collapsed ? 'Help & Support' : undefined}
        >
          <HelpCircle size={19} strokeWidth={1.8} />
          {!collapsed && <span>Help & Support</span>}
        </button>

        {onLogout && (
          <button
            type="button"
            className="sidebar-nav-item sidebar-logout"
            onClick={onLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={19} strokeWidth={1.8} />
            {!collapsed && <span>Logout</span>}
          </button>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}

            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        )}

      </div>
    </aside>
  )
}

export default DashboardSidebar