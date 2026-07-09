import { createAdminClient } from './../supabase/admin';
import { EmployeeProvisioningService, DefaultEmployeeIdGenerator } from './employee-provisioning';

const adminClient = createAdminClient();
const defaultGenerator = new DefaultEmployeeIdGenerator(adminClient);

export const employeeProvisioningService = new EmployeeProvisioningService(adminClient, defaultGenerator);
