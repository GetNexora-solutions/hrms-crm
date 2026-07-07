'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  role: z.string().min(1, 'Please select a role'),
  salary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Salary must be a positive number',
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function AddEmployeePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'employee',
      salary: '0',
    }
  })

  const roleValue = watch('role')

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/onboarding/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employee: data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create employee')
      }

      toast.success('Employee Created!', {
        description: `ID: ${result.employee.emp_id} | Pass: ${result.tempPassword}`,
        duration: 8000,
      })

      router.push('/employees')
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Add Employee</h1>
          <p className="text-slate-400">Create a new employee profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-slate-400">Basic contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="John Doe"
                />
                {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="john@nexorasolutions.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Employment Details</CardTitle>
            <CardDescription className="text-slate-400">Role and compensation information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-slate-300">Department <span className="text-red-500">*</span></Label>
                <Input
                  id="department"
                  {...register('department')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="Engineering, HR, Sales..."
                />
                {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation" className="text-slate-300">Designation <span className="text-red-500">*</span></Label>
                <Input
                  id="designation"
                  {...register('designation')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="Software Engineer"
                />
                {errors.designation && <p className="text-sm text-red-500">{errors.designation.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">System Role <span className="text-red-500">*</span></Label>
                <Select value={roleValue} onValueChange={(val) => setValue('role', val)}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-slate-300">Annual Salary <span className="text-red-500">*</span></Label>
                <Input
                  id="salary"
                  type="number"
                  {...register('salary')}
                  className="bg-slate-950 border-slate-800 text-white"
                  placeholder="0"
                />
                {errors.salary && <p className="text-sm text-red-500">{errors.salary.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/employees">
            <Button type="button" variant="outline" className="bg-transparent border-slate-700 text-slate-300 hover:text-white">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  )
}
