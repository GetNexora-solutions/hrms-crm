export type ResetPolicy = 'never' | 'yearly' | 'monthly' | 'daily'

export type EmployeeIdVariables = Record<string, string>

export interface EmployeeIdConfig {
  pattern: string
  serialLength: number
  startingNumber: number
  resetPolicy: ResetPolicy
}

/**
 * Validates the configuration before generation to fail fast.
 */
function validateConfig(config: EmployeeIdConfig) {
  if (!config.pattern.includes('{SERIAL}')) {
    throw new Error('Employee ID pattern must contain {SERIAL} placeholder.')
  }
  if (config.serialLength <= 0) {
    throw new Error('Employee ID serial length must be greater than 0.')
  }
  if (config.startingNumber < 1) {
    throw new Error('Employee ID starting number must be at least 1.')
  }
}

/**
 * Resolves all generic tokens (except {SERIAL}) in a given pattern.
 */
export function resolvePatternPrefixes(
  config: EmployeeIdConfig,
  variables: EmployeeIdVariables
): string {
  validateConfig(config)
  
  let resolved = config.pattern
  for (const [key, value] of Object.entries(variables)) {
    resolved = resolved.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return resolved
}

/**
 * Takes the resolved pattern and the DB-calculated serial number, and generates the final string.
 */
export function generateEmployeeId(
  resolvedPattern: string,
  serialNumber: number,
  serialLength: number
): string {
  const paddedSerial = serialNumber.toString().padStart(serialLength, '0')
  return resolvedPattern.replace('{SERIAL}', paddedSerial)
}
