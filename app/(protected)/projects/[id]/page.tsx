import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, CheckSquare, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProjectTasksPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('*, crm_clients(name)')
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
          <p className="text-slate-400">Client: {project.crm_clients?.name}</p>
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
                    <Badge variant="outline" className={
                      task.status === 'done' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                      task.status === 'in_progress' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                      'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                    }>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-slate-500">Assignee: <span className="text-slate-300">{task.employees?.full_name || 'Unassigned'}</span></span>
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" /> Due: {new Date(task.due_date).toLocaleDateString()}
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
              <div className="text-center py-12 text-slate-400">
                No tasks found for this project.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
