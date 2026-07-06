import { SupabaseClient } from '@supabase/supabase-js'
import { EmployeeIdConfig } from './employee-id'

export interface SerialContext {
  companyId: string
  joiningDate: Date
  prefixPart: string
  suffixPart: string
}

export async function getNextEmployeeSerial(
  supabaseAdmin: SupabaseClient,
  config: Pick<EmployeeIdConfig, 'startingNumber' | 'resetPolicy'>,
  context: SerialContext
): Promise<number> {
  const { companyId, joiningDate, prefixPart, suffixPart } = context

  let query = supabaseAdmin
    .from('employees')
    .select('emp_id, date_of_joining')
    .eq('company_id', companyId)
    .ilike('emp_id', `${prefixPart}%${suffixPart}`)

  // Apply reset policy boundaries based on joiningDate
  if (config.resetPolicy === 'yearly') {
    const startOfYear = new Date(joiningDate.getFullYear(), 0, 1).toISOString()
    const endOfYear = new Date(joiningDate.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString()
    query = query.gte('date_of_joining', startOfYear).lte('date_of_joining', endOfYear)
  } else if (config.resetPolicy === 'monthly') {
    const startOfMonth = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1).toISOString()
    const endOfMonth = new Date(joiningDate.getFullYear(), joiningDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()
    query = query.gte('date_of_joining', startOfMonth).lte('date_of_joining', endOfMonth)
  } else if (config.resetPolicy === 'daily') {
    const startOfDay = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate()).toISOString()
    const endOfDay = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate(), 23, 59, 59, 999).toISOString()
    query = query.gte('date_of_joining', startOfDay).lte('date_of_joining', endOfDay)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch existing employee IDs for serial calculation: ${error.message}`)
  }

  let maxSerial = 0

  if (data && data.length > 0) {
    for (const emp of data) {
      const id = emp.emp_id
      if (id.startsWith(prefixPart) && id.endsWith(suffixPart)) {
        const serialStr = id.slice(prefixPart.length, id.length - suffixPart.length)
        const serialNum = parseInt(serialStr, 10)
        if (!isNaN(serialNum) && serialNum > maxSerial) {
          maxSerial = serialNum
        }
      }
    }
  }

  return Math.max(maxSerial + 1, config.startingNumber)
}
