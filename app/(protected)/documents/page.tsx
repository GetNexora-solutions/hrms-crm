import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { File, Download } from 'lucide-react'
import { DocumentUpload } from './DocumentUpload'

export default async function DocumentsPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  // Admin sees all docs, employee sees own docs
  let query = supabase.from('documents').select('*, employees(full_name, emp_id)').order('created_at', { ascending: false })
  
  if (employee.role === 'employee') {
    query = query.eq('employee_id', employee.id)
  }

  const { data: documents } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Document Vault</h1>
          <p className="text-slate-400">Securely store and manage employee documents.</p>
        </div>
        <DocumentUpload employeeId={employee.id} />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Document Name</TableHead>
                {employee.role !== 'employee' && <TableHead className="text-slate-400">Employee</TableHead>}
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Uploaded Date</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((doc) => (
                <TableRow key={doc.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300 flex items-center gap-2">
                    <File className="h-4 w-4 text-blue-400" />
                    {doc.name}
                  </TableCell>
                  {employee.role !== 'employee' && (
                    <TableCell className="text-slate-300">
                      {doc.employees?.full_name} ({doc.employees?.emp_id})
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      {doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Assuming we will generate a signed URL on the fly in the API */}
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" asChild>
                      <a href={`/api/documents/${doc.id}/download`} target="_blank">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!documents || documents.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={employee.role !== 'employee' ? 5 : 4} className="text-center text-slate-400 h-24">
                    No documents found.
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
