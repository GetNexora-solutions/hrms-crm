"use client"

import { Sidebar } from './Sidebar'
import type { Role } from '@/lib/rbac'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

import Image from 'next/image'

interface ShellProps {
  children: React.ReactNode
  role: Role
  employeeName: string
  avatarUrl?: string | null
}

export function Shell({ children, role, employeeName, avatarUrl }: ShellProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Welcome back, {employeeName}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="rounded-full overflow-hidden">
               {avatarUrl ? (
                 <div className="relative h-8 w-8">
                   <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                 </div>
               ) : (
                 <User className="h-5 w-5" />
               )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-900 bg-slate-100 hover:bg-slate-200">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
