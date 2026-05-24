import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Archive,
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActivityLog, DashboardStats, Event } from '@/types/entities'
import { formatDate, formatDateTime, formatPercent } from '@/lib/utils'

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [eventGrowth, setEventGrowth] = useState<{ month: string; events: number }[]>([])
  const [rsvpStatusChart, setRsvpStatusChart] = useState<
    { name: string; value: number; fill: string }[]
  >([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((data) => {
        setStats(data.stats)
        setEventGrowth(data.eventGrowth)
        setRsvpStatusChart(data.rsvpStatusChart)
        setActivityLogs(data.activityLogs)
        setUpcomingEvents(data.upcomingEvents)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? 'Unable to load dashboard'}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your Invyte platform activity"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} />
        <StatCard title="Active Events" value={stats.activeEvents} icon={TrendingUp} />
        <StatCard title="Archived Events" value={stats.archivedEvents} icon={Archive} />
        <StatCard
          title="Total Guests"
          value={stats.totalGuests.toLocaleString()}
          icon={UserCheck}
        />
        <StatCard
          title="RSVP Response Rate"
          value={formatPercent(stats.rsvpResponseRate)}
          icon={Clock}
          subtitle="Across all events"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Event Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={eventGrowth}>
                <defs>
                  <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(168,85,247,0.15)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#9333ea"
                  strokeWidth={2}
                  fill="url(#eventGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RSVP Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={rsvpStatusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {rsvpStatusChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(168,85,247,0.15)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {rsvpStatusChart.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity yet.</p>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3"
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.description}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-pink-50/30 p-4"
                >
                  <div>
                    <p className="font-bold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.startDate)} · {event.hostName}
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                    {event.rsvp.going} going
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
