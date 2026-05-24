import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Eye, Pencil, Trash2 } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { EventStatusBadge } from '@/components/shared/status-badges'
import { EventDetailModal } from '@/components/modals/event-detail-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
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
import type { Event } from '@/types/entities'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Event | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getEvents({ search, status: statusFilter })
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(loadEvents, 300)
    return () => clearTimeout(timer)
  }, [loadEvents])

  const filtered = useMemo(() => events, [events])

  const handleArchive = async (id: string) => {
    await adminApi.archiveEvent(id)
    await loadEvents()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.deleteEvent(deleteTarget.id)
    setDeleteTarget(null)
    await loadEvents()
  }

  return (
    <div>
      <PageHeader title="Event Management" description="Manage all events across the platform" />

      <Card>
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search events or hosts..."
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'past', label: 'Past' },
            ]}
          />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>RSVP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((event) => {
                    const responded =
                      event.rsvp.going + event.rsvp.maybe + event.rsvp.notGoing
                    const progress =
                      event.totalInvited > 0
                        ? Math.round((responded / event.totalInvited) * 100)
                        : 0
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-semibold">{event.title}</TableCell>
                        <TableCell>{event.hostName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.category}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(event.startDate)}
                          <br />
                          <span className="text-gray-500">{event.startTime}</span>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm text-gray-600">
                          {event.venueAddress}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full gradient-primary"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <EventStatusBadge status={event.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelected(event)
                                setDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchive(event.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            {event.isArchived && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setDeleteTarget(event)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EventDetailModal event={selected} open={detailOpen} onOpenChange={setDetailOpen} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete event permanently?"
        description={`This will permanently delete "${deleteTarget?.title}". Archive the event first if it is not archived yet.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
