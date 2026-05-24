import { NavLink } from 'react-router-dom'
import {
  Archive,
  BarChart3,
  Bell,
  Calendar,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Palette,
  Settings,
  Tags,
  UserCheck,
  Users,
} from 'lucide-react'
import { BRAND_ICON } from '@/constants/category-assets'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/guests', label: 'Guests', icon: UserCheck },
  { to: '/rsvp-analytics', label: 'RSVP Analytics', icon: BarChart3 },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/themes', label: 'Themes', icon: Palette },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/archived', label: 'Archived Events', icon: Archive },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'gradient-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 shadow-2xl transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <img
          src={BRAND_ICON}
          alt="Invyte"
          className="h-10 w-10 shrink-0 rounded-2xl object-cover shadow-lg shadow-purple-500/30"
        />
        {!collapsed && (
          <div>
            <p className="text-lg font-black text-white">Invyte</p>
            <p className="text-xs text-purple-300/80">Admin Panel</p>
          </div>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'gradient-primary text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="m-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
