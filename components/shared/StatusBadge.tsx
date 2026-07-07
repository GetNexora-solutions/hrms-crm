import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = 'bg-slate-800 text-slate-300 border-slate-700' // Default

  const normalizedStatus = status.toLowerCase()

  if (['active', 'approved', 'paid', 'present', 'completed'].includes(normalizedStatus)) {
    colorClass = 'bg-green-500/10 text-green-500 border-green-500/20'
  } else if (['inactive', 'rejected', 'unpaid', 'absent'].includes(normalizedStatus)) {
    colorClass = 'bg-red-500/10 text-red-500 border-red-500/20'
  } else if (['pending', 'lead', 'late', 'in_progress'].includes(normalizedStatus)) {
    colorClass = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  }

  return (
    <Badge variant="outline" className={colorClass}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
