import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function ProjectTasksPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('*, crm_leads(name)')
    .eq('id', params.id)
    .single()
    
  if (!project) notFound()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, employees(full_name)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/projects" className="text-blue-500 hover:underline text-sm font-medium">Projects</Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400 text-sm font-medium">Tasks</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{project.name}</h1>
          <p className="text-slate-400">Client: {project.crm_leads?.name}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-500" /> Task Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tasks?.map((task) => (
              <div key={task.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex items-start justify-between group hover:border-slate-600 transition-colors">
                <div>
                  <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <StatusBadge status={task.status} />
                    <span className="text-slate-500">Assignee: <span className="text-slate-300">{task.employees?.full_name || 'Unassigned'}</span></span>
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" /> Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit
                </Button>
              </div>
            ))}
            
            {(!tasks || tasks.length === 0) && (
              <EmptyState />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
