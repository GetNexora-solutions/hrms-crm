import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OnboardingForm } from './OnboardingForm'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  if (!['super_admin', 'hr', 'admin'].includes(employee.role)) {
    redirect('/dashboard')
  }

  // Get active company
  const { data: company } = await supabase.from('companies').select('id').limit(1).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Employee Onboarding</h1>
        <p className="text-slate-400">Add a new employee and trigger the welcome process.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 max-w-3xl">
        <CardHeader>
          <CardTitle className="text-white">New Hire Details</CardTitle>
          <CardDescription className="text-slate-400">
            Filling out this form will create their HRMS account, generate their temporary password, and automatically send them a welcome email and WhatsApp message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm companyId={company?.id || null} hrId={employee.id} />
        </CardContent>
      </Card>
    </div>
  )
}
