"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentProps {
  totalAmount?: number
  originalAmount?: number
  currency?: string
  isDiscounted?: boolean
  discountType?: string
}

export default function Payment({
  totalAmount = 210.0,
  originalAmount,
  currency = "₱",
  isDiscounted = false,
  discountType = "Student Discount",
}: PaymentProps) {
  const router = useRouter()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handlePayAtCounter = async () => {
    setSelectedPaymentMethod("counter")
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      console.log("Proceeding with counter payment")
      setIsProcessing(false)
      // Navigate to confirmation or next step
    }, 1500)
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b via-gray-100 from-indigo-300 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-12">
        <button onClick={handleBack} className="mr-4" disabled={isProcessing}>
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
      </div>

      {/* Total Amount Section */}
      <div className="text-center mb-16">
        <p className="text-gray-600 text-lg mb-8">TOTAL</p>
        <p className="text-5xl font-bold text-gray-900  ">
          {currency}
          {formatAmount(totalAmount)}
        </p>

        {isDiscounted && originalAmount && (
          <div className="mt-4">
            <p className="text-lg text-gray-500 line-through">
              {currency}
              {formatAmount(originalAmount)}
            </p>
            <p className="text-sm text-green-600 font-medium mt-2">{discountType} Applied</p>
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="space-y-4 max-w-sm mx-auto mb-8">
        <Button
          onClick={handlePayAtCounter}
          disabled={isProcessing}
          variant="outline"
          className="w-full h-14 text-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg bg-transparent"
        >
          {isProcessing && selectedPaymentMethod === "counter" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pay at the Counter
            </div>
          )}
        </Button>
      </div>

      {/* Payment Method Info */}
      <div className="max-w-sm mx-auto text-center text-sm text-gray-500 mb-8">
        <p className="mb-2">Complete your payment at the counter when you arrive.</p>
      </div>
    </div>
  )
}
