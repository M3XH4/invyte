import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { EventStatusBadge } from '@/components/shared/status-badges'
import type { Event } from '@/types/entities'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, User, Users } from 'lucide-react'

type EventDetailModalProps = {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  if (!event) return null

  const responded = event.rsvp.going + event.rsvp.maybe + event.rsvp.notGoing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <EventStatusBadge status={event.status} />
            <Badge variant="outline">{event.category}</Badge>
            {event.isArchived && <Badge variant="archived">Archived</Badge>}
          </div>
          {event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}
          <div className="space-y-3 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-purple-500" />
              <span className="text-gray-500">Host:</span>
              <span className="font-semibold">{event.hostName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-gray-500">Date:</span>
              <span className="font-semibold">
                {formatDate(event.startDate)} at {event.startTime}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
              <span className="text-gray-500">Venue:</span>
              <span className="font-semibold">{event.venueAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-gray-500">RSVP:</span>
              <span className="font-semibold">
                {responded}/{event.totalInvited} ({event.responseRate}%)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Going', count: event.rsvp.going, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Maybe', count: event.rsvp.maybe, color: 'bg-amber-100 text-amber-700' },
              { label: 'No', count: event.rsvp.notGoing, color: 'bg-red-100 text-red-700' },
              { label: 'Pending', count: event.rsvp.pending, color: 'bg-violet-100 text-violet-700' },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-3 text-center ${item.color}`}>
                <p className="text-lg font-black">{item.count}</p>
                <p className="text-xs font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
