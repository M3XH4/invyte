import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RsvpStatusBadge } from '@/components/shared/status-badges'
import type { Guest } from '@/types/entities'
import { MessageSquare } from 'lucide-react'

type GuestAnswersModalProps = {
  guest: Guest | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GuestAnswersModal({ guest, open, onOpenChange }: GuestAnswersModalProps) {
  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            RSVP Answers — {guest.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">Event</span>
            <span className="text-sm font-semibold">{guest.eventTitle}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm text-gray-500">RSVP Status</span>
            <RsvpStatusBadge status={guest.rsvpStatus} />
          </div>
          {guest.answers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No custom questions answered yet.</p>
          ) : (
            <div className="space-y-3">
              {guest.answers.map((a, i) => (
                <div key={i} className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                  <p className="text-xs font-bold uppercase text-purple-600">{a.question}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{a.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
