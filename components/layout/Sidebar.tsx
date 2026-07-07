"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  Banknote,
  FileText,
  Briefcase,
  MonitorSmartphone,
  CreditCard,
  Target,
  FolderKanban,
  Settings,
  HelpCircle,
  IdCard,
  UserPlus,
  BookOpen
} from 'lucide-react'
import type { Role } from '@/lib/rbac'

interface SidebarProps {
  role: Role
}

const getRoutes = (role: Role) => {
  const routes = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'finance', 'employee', 'recruiter'] },
    { label: 'Employees', icon: Users, href: '/employees', roles: ['super_admin', 'hr', 'md', 'admin'] },
    { label: 'Onboarding', icon: UserPlus, href: '/onboarding', roles: ['super_admin', 'hr', 'md', 'admin'] },
    { label: 'Directory', icon: BookOpen, href: '/directory', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'finance', 'employee', 'recruiter'] },
    { label: 'Attendance', icon: Clock, href: '/attendance', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'employee'] },
    { label: 'Leaves', icon: CalendarDays, href: '/leaves', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'employee'] },
    { label: 'Payroll', icon: Banknote, href: '/payroll', roles: ['super_admin', 'hr', 'md', 'admin', 'finance', 'employee'] },
    { label: 'Documents', icon: FileText, href: '/documents', roles: ['super_admin', 'hr', 'md', 'admin', 'employee'] },
    { label: 'ID Card', icon: IdCard, href: '/id-card', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'finance', 'employee', 'recruiter'] },
    { label: 'Recruitment', icon: Briefcase, href: '/recruitment', roles: ['super_admin', 'hr', 'md', 'admin', 'recruiter'] },
    { label: 'Assets', icon: MonitorSmartphone, href: '/assets', roles: ['super_admin', 'hr', 'md', 'admin'] },
    { label: 'Expenses', icon: CreditCard, href: '/expenses', roles: ['super_admin', 'hr', 'md', 'admin', 'finance', 'manager', 'employee'] },
    { label: 'CRM', icon: Target, href: '/crm', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'employee'] },
    { label: 'Projects', icon: FolderKanban, href: '/projects', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'employee'] },
    { label: 'Helpdesk', icon: HelpCircle, href: '/helpdesk', roles: ['super_admin', 'hr', 'md', 'admin', 'manager', 'finance', 'employee', 'recruiter'] },
    { label: 'Admin', icon: Settings, href: '/admin', roles: ['super_admin'] },
  ]
  return routes.filter(route => route.roles.includes(role))
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const routes = getRoutes(role)

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-white truncate text-ellipsis">ABC HRMS</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {routes.map((route) => {
            const isActive = pathname.startsWith(route.href)
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
                  isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50"
                )}
              >
                <route.icon className={cn("h-4 w-4", isActive ? "text-blue-500" : "")} />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
