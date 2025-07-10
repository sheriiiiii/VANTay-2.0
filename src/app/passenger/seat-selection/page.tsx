//VANTay-2.0\src\app\passenger\seat-selection\page.tsx: 
import { Suspense } from "react"
import SeatSelection from "@/components/passenger-side/seatSelection"

function SeatSelectionFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading seat selection...</p>
      </div>
    </div>
  )
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={<SeatSelectionFallback />}>
      <SeatSelection />
    </Suspense>
  )
}