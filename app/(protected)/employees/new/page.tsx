import { Construction } from 'lucide-react'

export default function PlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white capitalize">Coming Soon</h1>
        <p className="text-slate-400">This module is currently under development.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center py-24 text-center">
        <Construction className="h-16 w-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-semibold text-slate-300 mb-2">Under Construction</h2>
        <p className="text-slate-500 max-w-sm">
          We are working hard to bring this feature to you. Please check back later.
        </p>
      </div>
    </div>
  )
}
