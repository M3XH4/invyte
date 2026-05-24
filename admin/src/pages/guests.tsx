import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSquare, UserCheck } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { TableToolbar } from '@/components/shared/table-toolbar'
import { RsvpStatusBadge } from '@/components/shared/status-badges'
import { GuestAnswersModal } from '@/components/modals/guest-answers-modal'
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
import type { Guest } from '@/types/entities'
import { formatDateTime } from '@/lib/utils'

export function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState('all')
  const [selected, setSelected] = useState<Guest | null>(null)
  const [answersOpen, setAnswersOpen] = useState(false)

  const loadGuests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getGuests({ search, rsvp_status: rsvpFilter })
      setGuests(data)
    } catch {
      setGuests([])
    } finally {
      setLoading(false)
    }
  }, [search, rsvpFilter])

  useEffect(() => {
    const timer = setTimeout(loadGuests, 300)
    return () => clearTimeout(timer)
  }, [loadGuests])

  const filtered = useMemo(() => guests, [guests])

  const attendanceLabel = (status: Guest['attendanceStatus']) => {
    if (status === 'checked_in') return { label: 'Checked In', variant: 'success' as const }
    if (status === 'no_show') return { label: 'No Show', variant: 'not_going' as const }
    return { label: 'Not Checked In', variant: 'pending' as const }
  }

  return (
    <div>
      <PageHeader title="Guest Management" description="View and manage guest RSVPs" />

      <Card>
        <CardContent className="p-4 md:p-6">
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search guests, email, events..."
            filterValue={rsvpFilter}
            onFilterChange={setRsvpFilter}
            filterOptions={[
              { value: 'all', label: 'All RSVP' },
              { value: 'going', label: 'Going' },
              { value: 'maybe', label: 'Maybe' },
              { value: 'not_going', label: 'Not Going' },
              { value: 'pending', label: 'Pending' },
            ]}
          />

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={UserCheck} title="No guests found" description="Try different search terms." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>RSVP</TableHead>
                    <TableHead>+1</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Checked In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((guest) => {
                    const att = attendanceLabel(guest.attendanceStatus)
                    return (
                      <TableRow key={guest.id}>
                        <TableCell className="font-semibold">{guest.name}</TableCell>
                        <TableCell className="text-sm text-gray-600">{guest.email}</TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm">
                          {guest.eventTitle}
                        </TableCell>
                        <TableCell>
                          <RsvpStatusBadge status={guest.rsvpStatus} />
                        </TableCell>
                        <TableCell>{guest.plusOnes}</TableCell>
                        <TableCell>
                          <Badge variant={att.variant}>{att.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {guest.checkedInAt ? formatDateTime(guest.checkedInAt) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelected(guest)
                              setAnswersOpen(true)
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Answers
                          </Button>
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

      <GuestAnswersModal guest={selected} open={answersOpen} onOpenChange={setAnswersOpen} />
    </div>
  )
}
