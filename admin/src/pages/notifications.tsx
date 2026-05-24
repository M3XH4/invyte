import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { notificationsApi } from '@/api/notificationsApi'
import { PageHeader } from '@/components/shared/page-header'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

const typeVariants: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  invite: 'info',
  reminder: 'warning',
  rsvp: 'success',
  system: 'default',
  announcement: 'info',
  event_updated: 'info',
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', search, readFilter, typeFilter],
    queryFn: () =>
      notificationsApi.list({
        search,
        read: readFilter === 'all' ? undefined : readFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  })

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Marked as read')
    },
  })

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const items = data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Platform notification delivery log"
        action={
          <Button
            variant="secondary"
            onClick={() => markAll.mutate()}
            disabled={!data?.unreadCount}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search notifications..."
            filterValue={readFilter}
            onFilterChange={setReadFilter}
            filterOptions={[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
          >
            <select
              className="h-10 rounded-xl border border-gray-200 bg-white/90 px-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All types</option>
              <option value="invite">Invite</option>
              <option value="reminder">Reminder</option>
              <option value="rsvp">RSVP</option>
              <option value="system">System</option>
              <option value="announcement">Announcement</option>
              <option value="event_updated">Event updated</option>
            </select>
          </TableToolbar>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="No matching notifications found." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-semibold">{n.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-300">
                        {n.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeVariants[n.type] ?? 'default'}>{n.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                        {n.recipient}
                      </TableCell>
                      <TableCell>
                        <Badge variant={n.isRead ? 'outline' : 'pending'}>
                          {n.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(n.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!n.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markRead.mutate(n.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
