import { useEffect, useState } from 'react'
import { Download, FileText, TrendingUp, Users } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const icons = [FileText, Users, TrendingUp]

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<
    { title: string; items: { label: string; value: string | number }[] }[]
  >([])

  useEffect(() => {
    adminApi
      .getReports()
      .then((data) => {
        setSections([
          { title: 'Event Statistics', items: data.eventStatistics },
          { title: 'User Activity', items: data.userActivity },
          { title: 'RSVP Performance', items: data.rsvpPerformance },
        ])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export and review platform analytics"
        action={
          <Button>
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section, index) => {
          const Icon = icons[index] ?? FileText
          return (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
            <Download className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Export Full Report</h3>
            <p className="mt-1 text-sm text-gray-500">
              Download a comprehensive CSV or PDF report with all event, user, and RSVP data.
            </p>
          </div>
          <Button size="lg">Download CSV</Button>
          <Button variant="secondary" size="lg">
            Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
