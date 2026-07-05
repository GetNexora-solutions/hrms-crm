"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Rocket } from 'lucide-react'

export function OnboardingForm({ companyId, hrId }: { companyId: string | null, hrId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    emp_id: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    role: 'employee',
    bank_name: '',
    bank_account: '',
    bank_ifsc: '',
    salary: '0'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create user auth + employee record + send welcome
      const res = await fetch('/api/onboarding/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: { ...formData, company_id: companyId }, hrId })
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success("Employee onboarded successfully!")
        toast.info(`WhatsApp: ${data.whatsapp}, Email: ${data.email}`)
        router.push('/employees')
      } else {
        toast.error(data.error || "Failed to onboard employee")
      }
    } catch {
      toast.error("An error occurred during onboarding.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employee ID (e.g. EMP001)</Label>
          <Input name="emp_id" value={formData.emp_id} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input name="full_name" value={formData.full_name} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>Phone (with country code, e.g. +91)</Label>
          <Input name="phone" value={formData.phone} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Input name="department" value={formData.department} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>Designation</Label>
          <Input name="designation" value={formData.designation} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-2">
          <Label>System Role</Label>
          <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Salary (Annual / Monthly)</Label>
          <Input type="number" name="salary" value={formData.salary} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 mt-6">
        <h3 className="text-lg font-medium text-white mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input name="bank_name" value={formData.bank_name} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input name="bank_account" value={formData.bank_account} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input name="bank_ifsc" value={formData.bank_ifsc} onChange={handleChange} required className="bg-slate-800 border-slate-700 text-white" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
        Complete Onboarding
      </Button>
    </form>
  )
}
