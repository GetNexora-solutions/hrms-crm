import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="text-sm font-medium text-slate-400">Loading module...</p>
    </div>
  )
}
