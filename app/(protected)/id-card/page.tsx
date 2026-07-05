import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { IDCardView } from './IDCardView'

export default async function IDCardPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  // Fetch full employee info with company details
  const { data: empData } = await supabase
    .from('employees')
    .select('*, companies(*)')
    .eq('id', employee.id)
    .single()

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
