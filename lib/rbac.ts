import { createClient } from './supabase/server'

export type Role = 'super_admin' | 'hr' | 'md' | 'admin' | 'manager' | 'finance' | 'employee' | 'recruiter'

export async function getCurrentEmployee() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (empError || !employee) {
    return null
  }

  if (employee.status === 'inactive') {
    return null
  }

  return employee
}

export function hasPermission(employeeRole: string, allowedRoles: Role[]) {
  if (employeeRole === 'super_admin') return true
  return allowedRoles.includes(employeeRole as Role)
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR: 'hr',
  MD: 'md',
  ADMIN: 'admin',
  MANAGER: 'manager',
  FINANCE: 'finance',
  EMPLOYEE: 'employee',
  RECRUITER: 'recruiter'
}
