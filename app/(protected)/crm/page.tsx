import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building, Phone, Mail } from 'lucide-react'

export default async function CRMPage() {
  const supabase = createClient()
  
  const { data: clients } = await supabase
    .from('crm_clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">CRM - Clients & Leads</h1>
          <p className="text-slate-400">Manage your company's clients and leads.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add Client</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{clients?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Company Name</TableHead>
                <TableHead className="text-slate-400">Contact Person</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.map((client) => (
                <TableRow key={client.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div>{client.contact_person}</div>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                      {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3"/> {client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {client.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      client.status === 'active' ? 'text-green-500 border-green-500' :
                      client.status === 'lead' ? 'text-yellow-500 border-yellow-500' :
                      'text-slate-500 border-slate-500'
                    }>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!clients || clients.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={4} className="text-center text-slate-400 h-24">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
