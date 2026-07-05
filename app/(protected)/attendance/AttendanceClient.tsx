"use client"

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MapPin, Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AttendanceClientProps {
  employeeId: string
  initialData: { check_in: string | null, check_out: string | null } | null
}

export function AttendanceClient({ employeeId, initialData }: AttendanceClientProps) {
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const router = useRouter()

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    return imageSrc
  }, [webcamRef])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      // 1. Get GPS
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // 2. Capture Selfie
          const selfieBase64WithPrefix = capture()
          if (!selfieBase64WithPrefix) {
            toast.error("Could not capture selfie. Ensure camera permissions are granted.")
            setCheckingIn(false)
            return
          }
          
          const selfieBase64 = selfieBase64WithPrefix.split(',')[1]

          // 3. Send to API
          const response = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId,
              selfieBase64,
              lat: latitude,
              lng: longitude,
              type: 'check_in'
            })
          })

          const result = await response.json()
          if (result.success) {
            toast.success("Checked in successfully!")
            router.refresh()
          } else {
            toast.error(result.error || "Failed to check in.")
          }
          setCheckingIn(false)
        },
        () => {
          toast.error("Location access denied. Cannot check in.")
          setCheckingIn(false)
        },
        { enableHighAccuracy: true }
      )
    } catch {
      toast.error("An unexpected error occurred.")
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          const response = await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId,
              lat: latitude,
              lng: longitude,
              type: 'check_out'
            })
          })

          const result = await response.json()
          if (result.success) {
            toast.success("Checked out successfully!")
            router.refresh()
          } else {
            toast.error(result.error || "Failed to check out.")
          }
          setLoading(false)
        },
        () => {
          toast.error("Location access denied.")
          setLoading(false)
        }
      )
    } catch {
      toast.error("An unexpected error occurred.")
      setLoading(false)
    }
  }

  if (initialData?.check_in && initialData?.check_out) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-medium text-white">Attendance Complete</h3>
        <p className="text-slate-400">You have completed your shift for today.</p>
      </div>
    )
  }

  if (initialData?.check_in && !initialData?.check_out) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-6">
        <div className="text-center">
          <p className="text-slate-400 mb-1">Checked In At</p>
          <p className="text-3xl font-bold text-white">{new Date(initialData.check_in).toLocaleTimeString()}</p>
        </div>
        <Button 
          size="lg" 
          variant="destructive" 
          className="w-full max-w-sm"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Check Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm backdrop-blur-md">
          <MapPin className="h-4 w-4 text-red-400" /> GPS Required
        </div>
      </div>
      <Button 
        size="lg" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
        onClick={handleCheckIn}
        disabled={checkingIn}
      >
        {checkingIn ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Location & Face...</>
        ) : (
          <><Camera className="mr-2 h-5 w-5" /> Check In Now</>
        )}
      </Button>
    </div>
  )
}
