"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ReceiptProps {
  tripNumber?: string
  route?: string
  seatNumber?: string | number
  bookingReference?: string
  qrCodeData?: string
}

export default function ReceiptPage({
  tripNumber = "Trip 1",
  route = "Iloilo to San Jose",
  seatNumber = "8",
  bookingReference = "VANTAY-001-2024",
  qrCodeData = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VANTAY-BOOKING-001-2024",
}: ReceiptProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleDownload = () => {
    // Create a canvas to generate the ticket image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (ctx) {
      canvas.width = 400
      canvas.height = 700 // Increased height to accommodate QR code

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add watermark background text
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.font = "bold 60px Arial"
      ctx.textAlign = "center"
      ctx.fillText("VANTAY", canvas.width / 2, canvas.height / 2 - 50)

      // Add main content
      ctx.fillStyle = "#000000"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("VANTAY", canvas.width / 2, 80)

      // Large seat number
      ctx.font = "bold 80px Arial"
      ctx.fillText(seatNumber.toString(), canvas.width / 2, 200)

      // Trip information
      ctx.font = "bold 18px Arial"
      ctx.fillText(tripNumber, canvas.width / 2, 280)

      ctx.font = "16px Arial"
      ctx.fillText(route, canvas.width / 2, 310)

      // Load and draw QR code
      const qrImage = new window.Image()
      qrImage.crossOrigin = "anonymous"
      qrImage.onload = () => {
        // Draw QR code
        const qrSize = 120
        const qrX = (canvas.width - qrSize) / 2
        const qrY = 380
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

        // Convert to blob and download after QR code is drawn
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `vantay-ticket-${bookingReference}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }

      qrImage.onerror = () => {
        // If QR code fails to load, still generate the ticket without it
        console.warn("QR code failed to load, generating ticket without QR code")
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `vantay-ticket-${bookingReference}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })
      }

      // Set the QR code source
      qrImage.src = qrCodeData || "/placeholder.svg"
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Pending Payment !</h1>
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <p className="text-gray-600 text-sm">Please proceed to the counter and present this .</p>
      </div>

      {/* Receipt/Ticket Card */}
      <div className="max-w-sm mx-auto mb-8">
        <Card className="bg-white shadow-lg rounded-3xl border-0 overflow-hidden relative">
          <CardContent className="p-8 text-center">
            {/* Download Button - positioned at top of card */}
            <div className="mb-6">
              <Button
                onClick={handleDownload}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full px-4 py-2"
              >
                <span className="text-sm font-medium mr-2">Download</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Background Logo - Watermarked */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="text-6xl font-bold text-gray-300 tracking-wider">VANTAY</div>
            </div>

            {/* Seat Number - Prominent display */}
            <div className="mb-8 relative z-10">
              <div className="text-8xl font-bold text-gray-900 mb-2">{seatNumber}</div>
            </div>

            {/* Trip Information */}
            <div className="mb-8 relative z-10">
              <p className="text-lg font-semibold text-gray-900 mb-1">{tripNumber}</p>
              <p className="text-gray-700 text-sm">{route}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center relative z-10">
              <Image
                src={qrCodeData || "/placeholder.svg"}
                alt="Booking QR Code"
                width={120}
                height={120}
                className="w-30 h-30"
                crossOrigin="anonymous"
                unoptimized
                priority
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home Button */}
      <div className="max-w-sm mx-auto">
        <Button
          onClick={handleBackToHome}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl h-12 font-medium"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
