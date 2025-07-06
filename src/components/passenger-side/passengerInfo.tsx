"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"

interface PassengerData {
  name: string
  address: string
  age: string
  contactNumber: string
  emergencyContact: string
  classification: string
}

// Skeleton component for the passenger info form
function PassengerInfoSkeleton() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-blue-100 px-4 py-6">
      {/* Header with real title */}
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4" title="Go back" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Passenger Information</h1>
          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse mt-1"></div>
        </div>
      </div>

      {/* Form Container Skeleton */}
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg border-0 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Form fields skeleton */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-300 rounded animate-pulse"></div>
                </div>
              ))}

              {/* Submit Button Skeleton */}
              <div className="pt-4">
                <div className="w-full h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info Skeleton */}
      <div className="max-w-md mx-auto mt-8 p-3 bg-gray-100 rounded">
        <div className="w-16 h-3 bg-gray-300 rounded animate-pulse mb-2"></div>
        <div className="space-y-1">
          <div className="w-20 h-3 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-20 h-3 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default function PassengerInfo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get("tripId")
  const seatId = searchParams.get("seatId")
  const seatNumber = searchParams.get("seatNumber")

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<PassengerData>({
    name: "",
    address: "",
    age: "",
    contactNumber: "",
    emergencyContact: "",
    classification: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate loading for form initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800) // Simulate loading time

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tripId || !seatId) {
      setError("Missing trip or seat information")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/passenger/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId: Number(tripId),
          seatId: Number(seatId),
          passengerName: formData.name,
          passengerAddress: formData.address,
          passengerAge: Number(formData.age),
          passengerPhone: formData.contactNumber,
          passengerEmergencyContact: formData.emergencyContact || formData.contactNumber,
          passengerType: formData.classification.toUpperCase().replace(" ", "_"),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to create ticket")
      }

      sessionStorage.setItem("ticketData", JSON.stringify(data.ticket))
      router.push(`/passenger/payment?ticketId=${data.ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = () => {
    const requiredFields = ["name", "address", "age", "contactNumber", "classification"]
    return requiredFields.every((field) => formData[field as keyof PassengerData].trim() !== "")
  }

  const requiresIdVerification = ["Student", "PWD", "Senior Citizen"].includes(formData.classification)

  if (!tripId || !seatId) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Missing trip or seat information</p>
          <p className="text-sm text-gray-600 mb-4">
            Trip ID: {tripId || "Missing"} | Seat ID: {seatId || "Missing"}
          </p>
          <Button onClick={() => router.push("/passenger/trips")}>Back to Trips</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <PassengerInfoSkeleton />
  }

  return (
    <div className="min-h-screen bg-blue-100 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={handleBack} className="mr-4" title="Go back" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Passenger Information</h1>
          <p className="text-sm text-gray-600">Seat {seatNumber}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Form Container */}
      <div className="max-w-md mx-auto ">
        <Card className=" shadow-lg border-0 bg-blue-50">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-bold">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-white border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700 font-bold">
                  Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-white border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter your address"
                  disabled={isSubmitting}
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-700 font-bold">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="bg-white border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  disabled={isSubmitting}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-gray-700 font-bold">
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="bg-white border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Enter your contact number"
                  disabled={isSubmitting}
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-gray-700 font-bold">
                  Emergency Contact
                </Label>
                <Input
                  id="emergencyContact"
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className="bg-white border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Emergency contact (optional)"
                  disabled={isSubmitting}
                />
              </div>

              {/* Classification */}
              <div className="space-y-2">
                <Label htmlFor="classification" className="text-gray-700 font-bold">
                  Classification *
                </Label>
                <Select
                  value={formData.classification}
                  onValueChange={(value) => handleInputChange("classification", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-1 border-gray-400 shadow-sm h-10 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular (₱210)</SelectItem>
                    <SelectItem value="Student">Student (₱170)</SelectItem>
                    <SelectItem value="PWD">PWD (₱170)</SelectItem>
                    <SelectItem value="Senior Citizen">Senior Citizen (₱170)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID Verification */}
              {requiresIdVerification && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">
                    **If Student, PWDs, or Senior Citizen, please present your ID at the counter.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg h-12 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    "Save and Continue"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
