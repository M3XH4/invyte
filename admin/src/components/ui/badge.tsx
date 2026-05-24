import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-purple-100 text-purple-700',
        going: 'border-transparent bg-emerald-100 text-emerald-700',
        maybe: 'border-transparent bg-amber-100 text-amber-700',
        not_going: 'border-transparent bg-red-100 text-red-700',
        pending: 'border-transparent bg-violet-100 text-violet-700',
        upcoming: 'border-transparent bg-sky-100 text-sky-700',
        ongoing: 'border-transparent bg-cyan-100 text-cyan-700',
        past: 'border-transparent bg-gray-100 text-gray-600',
        archived: 'border-transparent bg-slate-200 text-slate-600',
        admin: 'border-transparent bg-fuchsia-100 text-fuchsia-700',
        host: 'border-transparent bg-purple-100 text-purple-700',
        guest: 'border-transparent bg-blue-100 text-blue-700',
        active: 'border-transparent bg-emerald-100 text-emerald-700',
        suspended: 'border-transparent bg-red-100 text-red-700',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
        outline: 'border-gray-200 bg-white text-gray-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
