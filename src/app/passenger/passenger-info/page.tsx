//VANTay-2.0\src\app\passenger\passenger-info\page.tsx :  
import { Suspense } from "react"
import PassengerInfo from "@/components/passenger-side/passengerInfo"

function PassengerInfoFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}

export default function PassengerInfoPage() {
  return (
    <Suspense fallback={<PassengerInfoFallback />}>
      <PassengerInfo />
    </Suspense>
  )
}