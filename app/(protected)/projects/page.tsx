import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = createClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*, crm_clients(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-slate-400">Manage client projects and track progress.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="bg-slate-900 border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={
                  project.status === 'completed' ? 'text-green-500 border-green-500 bg-green-500/10' :
                  project.status === 'in_progress' ? 'text-blue-500 border-blue-500 bg-blue-500/10' :
                  'text-yellow-500 border-yellow-500 bg-yellow-500/10'
                }>
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">ID: {project.id.substring(0,8)}</span>
              </div>
              <CardTitle className="text-white text-xl line-clamp-1">{project.name}</CardTitle>
              <CardDescription className="text-slate-400 line-clamp-2">
                {project.description || 'No description provided.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-300">
                  <span className="text-slate-500">Client</span>
                  <span className="font-medium">{project.crm_clients?.name}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Start</span>
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> End</span>
                  <span>{new Date(project.end_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                    View Tasks
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!projects || projects.length === 0) && (
          <div className="col-span-full text-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}
