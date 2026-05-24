import { Badge } from '@/components/ui/badge'
import type { EventStatus, RsvpStatus, UserRole, UserStatus } from '@/types/entities'

export function RsvpStatusBadge({ status }: { status: RsvpStatus }) {
  const labels: Record<RsvpStatus, string> = {
    going: 'Going',
    maybe: 'Maybe',
    not_going: 'Not Going',
    pending: 'Pending',
  }
  return <Badge variant={status}>{labels[status]}</Badge>
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const labels: Record<EventStatus, string> = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    past: 'Past',
    archived: 'Archived',
  }
  return <Badge variant={status}>{labels[status]}</Badge>
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === 'active' ? 'active' : status === 'suspended' ? 'suspended' : 'pending'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
