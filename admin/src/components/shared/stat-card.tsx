import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: string
  iconClassName?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, iconClassName }: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-xl hover:shadow-purple-500/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            {trend && <p className="mt-2 text-xs font-semibold text-emerald-600">{trend}</p>}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-purple-500/20',
              iconClassName,
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
