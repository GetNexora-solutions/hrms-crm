import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { IDCardView } from './IDCardView'
import { ErrorState } from '@/components/shared/ErrorState'

export default async function IDCardPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  // Fetch full employee info with company details
  const { data: empData, error: idError } = await supabase
    .from('employees')
    .select('*, companies(*)')
    .eq('id', employee.id)
    .single()

  if (idError) {
    return (
      <ErrorState message={idError.message} />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">ID Card</h1>
        <p className="text-slate-400">View and print your digital ID card.</p>
      </div>

      <div className="flex justify-center py-8">
        <IDCardView employee={empData} />
      </div>
    </div>
  )
}
