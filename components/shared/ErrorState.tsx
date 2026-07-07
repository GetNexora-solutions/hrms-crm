import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = "An unknown error occurred" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-900 border border-slate-800 rounded-lg mt-6">
      <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">Failed to load data</h3>
      <p className="text-sm">{message}</p>
    </div>
  )
}
