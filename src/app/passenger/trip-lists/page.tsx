//VANTay-2.0\src\app\passenger\trip-lists\page.tsx: 
import { Suspense } from "react"
import TripLists from "@/components/passenger-side/tripLists"

function TripListsFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}

export default function TriplistsPage() {
  return (
    <Suspense fallback={<TripListsFallback />}>
      <TripLists />
    </Suspense>
  )
} 