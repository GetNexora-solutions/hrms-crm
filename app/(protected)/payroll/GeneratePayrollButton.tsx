"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function GeneratePayrollButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setLoading(true)
    const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    
    // Default to 22 working days for simplicity
    const payload = {
      month: currentMonth,
      workingDays: 22
    }

    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Payroll generated for ${data.processed} employees!`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to generate payroll")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
      Generate Current Month
    </Button>
  )
}
