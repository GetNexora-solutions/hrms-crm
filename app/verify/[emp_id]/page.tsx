import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function VerifyPage({ params }: { params: { emp_id: string } }) {
  const supabase = createClient()
  
  // Public verification check
  const { data: employee } = await supabase
    .from('employees')
    .select('*, companies(name)')
    .eq('emp_id', params.emp_id)
    .single()

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 border-t-red-500 border-t-4">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-500 text-2xl">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-slate-400">
            No employee found with ID: {params.emp_id}. This ID card may be invalid or forged.
          </CardContent>
        </Card>
      </div>
    )
  }

  const isActive = employee.status === 'active'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className={`max-w-md w-full bg-slate-900 border-slate-800 border-t-4 ${isActive ? 'border-t-green-500' : 'border-t-red-500'}`}>
        <CardHeader className="text-center">
          {isActive ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <CardTitle className={isActive ? 'text-green-500 text-2xl' : 'text-red-500 text-2xl'}>
            {isActive ? 'Verified Employee' : 'Inactive Employee'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700">
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500 font-bold">
                  {employee.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-white">{employee.full_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-500">Employee ID</span>
              <span className="font-medium text-white">{employee.emp_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-500">Company</span>
              <span className="font-medium text-white">{employee.companies?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-500">Designation</span>
              <span className="font-medium text-white">{employee.designation}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-white">{employee.department}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
