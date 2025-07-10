//VANTay-2.0\src\app\passenger\receipt\page.tsx: 
import { Suspense } from "react"
import Receipt from "@/components/passenger-side/receipt"

function ReceiptFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<ReceiptFallback />}>
      <Receipt />
    </Suspense>
  )
}