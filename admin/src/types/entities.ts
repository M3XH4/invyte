export type UserRole = 'admin' | 'host' | 'guest'
export type UserStatus = 'active' | 'suspended' | 'pending'
export type RsvpStatus = 'going' | 'maybe' | 'not_going' | 'pending'
export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'archived'
export type AttendanceStatus = 'checked_in' | 'not_checked_in' | 'no_show'

export type User = {
  id: string
  name: string
  email: string
  username: string
  role: UserRole
  status: UserStatus
  avatarUrl?: string
  totalHostedEvents: number
  guestRsvpCount: number
  joinedAt: string
}

export type EventCategory = {
  id: string
  name: string
  slug: string
  image?: string
  icon?: string
  color: string
  description?: string
  isActive: boolean
  eventCount: number
}

export type Theme = {
  id: string
  name: string
  slug?: string
  categoryId?: string
  category: string
  previewColors: string[]
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  mood?: string
  isActive: boolean
  usageCount: number
  status?: 'active' | 'draft' | 'disabled'
}

export type EventRsvpCounts = {
  going: number
  maybe: number
  notGoing: number
  pending: number
}

export type Event = {
  id: string
  title: string
  slug: string
  hostId: string
  hostName: string
  category: string
  categorySlug: string
  startDate: string
  startTime: string
  venueAddress: string
  status: EventStatus
  isArchived: boolean
  archivedAt?: string | null
  rsvp: EventRsvpCounts
  totalInvited: number
  responseRate: number
  description?: string
  maxGuests?: number
  createdAt: string
}

export type Guest = {
  id: string
  name: string
  email: string
  eventId: string
  eventTitle: string
  rsvpStatus: RsvpStatus
  plusOnes: number
  attendanceStatus: AttendanceStatus
  checkedInAt?: string | null
  answers: { question: string; answer: string }[]
}

export type ActivityLog = {
  id: string
  action: string
  description: string
  userName?: string
  eventTitle?: string
  createdAt: string
  type: 'event' | 'user' | 'rsvp' | 'system'
}

export type Notification = {
  id: string
  title: string
  message: string
  type: string
  recipient: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export type RsvpStats = {
  going: number
  maybe: number
  notGoing: number
  pending: number
  attendanceRate: number
  responseRate: number
}

export type DashboardStats = {
  totalUsers: number
  totalEvents: number
  activeEvents: number
  archivedEvents: number
  totalGuests: number
  rsvpResponseRate: number
}

export type AppSettings = {
  appName: string
  publicFrontendUrl: string
  emailNotifications: boolean
  pushNotifications: boolean
  rsvpDeadlineDays: number
  maxUploadMb: number
  adminName: string
  adminEmail: string
}
