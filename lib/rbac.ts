import { createClient } from './supabase/server'
export type Role = 'super_admin' | 'hr' | 'md' | 'admin' | 'manager' | 'finance' | 'employee' | 'recruiter'

export async function getCurrentEmployee() {
  const supabase = createClient()
  // Mock m.scott employee
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .limit(1)
    .single()
  
  return employee
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasPermission(_employeeRole: string, _allowedRoles: Role[]) {
  return true;
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
