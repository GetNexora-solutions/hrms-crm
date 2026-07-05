"use client"
import QRCode from 'react-qr-code'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import Image from 'next/image'

export function IDCardView({ employee }: { employee: { emp_id: string, full_name: string, designation?: string, department?: string, blood_group?: string, emergency_contact?: string, avatar_url?: string | null, companies?: { name: string } | null } }) {
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${employee.emp_id}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 flex-wrap justify-center print:flex-col print:gap-4 id-card-container">
        
        {/* Front of ID Card */}
        <div className="w-[350px] h-[550px] bg-gradient-to-b from-slate-100 to-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 relative print:shadow-none print:border-black print:break-inside-avoid">
          {/* Header */}
          <div className="bg-blue-600 h-32 flex flex-col items-center justify-center text-white relative">
            <h2 className="text-xl font-bold tracking-wider uppercase">{employee.companies?.name || 'Company Name'}</h2>
            <div className="absolute -bottom-16 w-32 h-32 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg flex items-center justify-center">
              {employee.avatar_url ? (
                <Image src={employee.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-4xl font-bold">
                  {employee.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="pt-20 pb-6 px-6 flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{employee.full_name}</h1>
            <p className="text-blue-600 font-semibold mb-6">{employee.designation}</p>
            
            <div className="w-full space-y-3 text-sm text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">EMP ID</span>
                <span className="font-bold">{employee.emp_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Department</span>
                <span className="font-bold">{employee.department}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-semibold text-slate-500">Blood Group</span>
                <span className="font-bold">{employee.blood_group || 'O+'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 w-full bg-blue-600 text-white text-xs text-center py-2">
            www.company.com
          </div>
        </div>

        {/* Back of ID Card */}
        <div className="w-[350px] h-[550px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 relative print:shadow-none print:border-black print:break-inside-avoid flex flex-col">
          <div className="bg-slate-100 p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Terms & Conditions</h3>
          </div>
          <div className="p-6 text-xs text-slate-600 space-y-2 flex-1">
            <p>1. This card is the property of the company and must be returned upon request or termination of employment.</p>
            <p>2. It must be worn at all times while on company premises.</p>
            <p>3. If lost or found, please return to the HR department.</p>
            
            <div className="mt-6">
              <span className="font-semibold text-slate-800">Emergency Contact:</span>
              <p>{employee.emergency_contact || '+1 234 567 8900'}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-t border-slate-200">
            <div className="bg-white p-2 rounded shadow-sm border border-slate-200">
              <QRCode value={verifyUrl} size={100} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Scan to verify employee</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center print:hidden">
        <Button onClick={handlePrint} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Printer className="mr-2 h-5 w-5" /> Print ID Card
        </Button>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .id-card-container, .id-card-container * {
            visibility: visible;
          }
          .id-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: auto;  margin: 0mm; }
        }
      `}</style>
    </div>
  )
}
