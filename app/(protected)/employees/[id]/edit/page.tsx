import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditEmployeeClient from './edit-client'

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !employee) {
    notFound()
  }

  return <EditEmployeeClient employee={employee} />
}
