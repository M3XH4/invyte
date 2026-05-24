import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CheckCircle, Clock, HelpCircle, XCircle } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/utils'

export function RsvpAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.getRsvpAnalytics>> | null>(
    null,
  )

  useEffect(() => {
    adminApi
      .getRsvpAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
    )
  }

  return (
    <div>
      <PageHeader
        title="RSVP Analytics"
        description="Track response rates and attendance across events"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Going" value={data.going.toLocaleString()} icon={CheckCircle} />
        <StatCard title="Maybe" value={data.maybe.toLocaleString()} icon={HelpCircle} />
        <StatCard title="Not Going" value={data.notGoing.toLocaleString()} icon={XCircle} />
        <StatCard title="Pending" value={data.pending.toLocaleString()} icon={Clock} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-sm font-bold uppercase text-gray-500">Attendance Rate</p>
            <p className="mt-2 text-5xl font-black gradient-text">
              {formatPercent(data.attendanceRate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-sm font-bold uppercase text-gray-500">Overall Response Rate</p>
            <p className="mt-2 text-5xl font-black gradient-text">
              {formatPercent(data.responseRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.responseRateOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(168,85,247,0.15)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: '#9333ea', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.categoryActivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(168,85,247,0.15)',
                  }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
