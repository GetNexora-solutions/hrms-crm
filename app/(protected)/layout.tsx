import { Shell } from '@/components/layout/Shell'
import { getCurrentEmployee } from '@/lib/rbac'
import { redirect } from 'next/navigation'
import { ChatWidget } from '@/components/ai-agent/ChatWidget'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()

  if (!employee) {
    redirect('/login')
  }

  // Force password change if temp password
  // (Assuming there's a middleware, but extra safety here)

  return (
    <Shell 
      role={employee.role} 
      employeeName={employee.full_name} 
      avatarUrl={employee.avatar_url}
    >
      {children}
      <ChatWidget employeeName={employee.full_name} role={employee.role} />
    </Shell>
  )
}
