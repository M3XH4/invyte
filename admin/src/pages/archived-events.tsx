import { useCallback, useEffect, useState } from 'react'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
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
import { formatDate, formatDateTime } from '@/lib/utils'

export function ArchivedEventsPage() {
  const [archived, setArchived] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)

  const loadArchived = useCallback(async () => {
    setLoading(true)
    try {
      setArchived(await adminApi.getArchivedEvents())
    } catch {
      setArchived([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArchived()
  }, [loadArchived])

  const handleRestore = async (id: string) => {
    await adminApi.restoreEvent(id)
    await loadArchived()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.deleteEvent(deleteTarget.id)
    setDeleteTarget(null)
    await loadArchived()
  }

  return (
    <div>
      <PageHeader
        title="Archived Events"
        description="Restore or permanently delete archived events"
      />

      <Card>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : archived.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No archived events"
              description="Archived events will appear here."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Archived Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archived.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-semibold">{event.title}</TableCell>
                      <TableCell>{event.hostName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.category}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(event.startDate)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(event.archivedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRestore(event.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setDeleteTarget(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Permanently delete event?"
        description={`"${deleteTarget?.title}" will be permanently removed.`}
        confirmLabel="Delete Forever"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
