import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Mail, Phone, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function DirectoryPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createClient()
  
  let query = supabase.from('employees').select('*, companies(name)').eq('status', 'active').order('full_name')
  
  if (searchParams.q) {
    query = query.or(`full_name.ilike.%${searchParams.q}%,department.ilike.%${searchParams.q}%,designation.ilike.%${searchParams.q}%`)
  }

  const { data: employees } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Employee Directory</h1>
          <p className="text-slate-400">Find and connect with your colleagues.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <form className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search by name, department, or designation..." 
              className="pl-10 h-12 bg-slate-800 border-slate-700 text-white text-lg w-full max-w-2xl"
            />
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees?.map((emp) => (
          <Card key={emp.id} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500/50 transition-colors">
            <div className="h-24 bg-gradient-to-r from-blue-900/50 to-slate-800/50" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="flex justify-between items-start">
                <div className="absolute -top-12 h-24 w-24 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
                  {emp.avatar_url ? (
                    <img src={emp.avatar_url} alt={emp.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-500">
                      {emp.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-28 mt-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {emp.companies?.name || 'Company'}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 pt-8">
                <h3 className="text-xl font-bold text-white mb-1">{emp.full_name}</h3>
                <p className="text-blue-400 font-medium mb-4">{emp.designation}</p>
                
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <a href={`mailto:${emp.email}`} className="hover:text-blue-400 transition-colors">{emp.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <a href={`tel:${emp.phone}`} className="hover:text-blue-400 transition-colors">{emp.phone}</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees?.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No employees found matching your search.
        </div>
      )}
    </div>
  )
}
