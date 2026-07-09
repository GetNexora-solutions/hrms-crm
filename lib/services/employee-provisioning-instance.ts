import { createAdminClient } from './../supabase/admin';
import { EmployeeProvisioningService } from './employee-provisioning';

export const employeeProvisioningService = new EmployeeProvisioningService(createAdminClient());
