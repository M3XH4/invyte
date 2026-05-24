import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'

type HeaderProps = {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/60 bg-white/70 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1120]/80 md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-3">
        <NotificationDropdown />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-white">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
