import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationsApi } from '@/api/notificationsApi'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function NotificationDropdown() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
  })

  const { data } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationsApi.list({ read: 'unread' }),
    enabled: open,
  })

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const items = (data?.items ?? []).slice(0, 6)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#11131f]">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
              <p className="font-bold text-gray-900 dark:text-white">Notifications</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAll.mutate()}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">No unread notifications</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      'w-full border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-purple-50/50 dark:border-white/5 dark:hover:bg-white/5',
                      !n.isRead && 'bg-purple-50/30 dark:bg-purple-500/10',
                    )}
                    onClick={() => {
                      if (!n.isRead) markRead.mutate(n.id)
                    }}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 p-2 dark:border-white/10">
              <Button
                variant="secondary"
                className="w-full"
                size="sm"
                onClick={() => {
                  setOpen(false)
                  navigate('/notifications')
                }}
              >
                View all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
