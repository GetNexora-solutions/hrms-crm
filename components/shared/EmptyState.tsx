import { Inbox } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Inbox className="h-8 w-8 mb-2 opacity-50" />
      <p className="font-medium text-slate-300">No records found</p>
      <p className="text-sm">There is no data to display at this time.</p>
    </div>
  )
}
