"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PassengerData {
  name: string
  address: string
  age: string
  contactNumber: string
  classification: string
}

export default function PassengerInfo() {
  const router = useRouter()
  const [formData, setFormData] = useState<PassengerData>({
    name: "",
    address: "",
    age: "",
    contactNumber: "",
    classification: "",
  })

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Passenger information:", formData)
    // Redirect to payment page after form submission
    router.push("/passenger/payment")
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== "")
  }

  const requiresIdVerification = ["Student", "PWD", "Senior Citizen"].includes(
    formData.classification
  )

  return (
    <div className="min-h-screen bg-gradient-to-b via-gray-100 from-indigo-300 px-4 py-6">
      {/* Header */}
      <div className="flex items-center mb-12">
        <button onClick={handleBack} className="mr-4" title="Go back" aria-label="Go back">
          <ArrowLeft className="h-6 w-6 text-gray-900" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Passenger Information</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-bold">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="bg-gray-200 border-0 h-10 text-gray-900"
            placeholder="Enter your full name"
          />
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-700 font-bold">
            Address
          </Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="bg-gray-200 border-0 h-10 text-gray-900"
            placeholder="Enter your address"
          />
        </div>

        {/* Age Field */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-gray-700 font-bold">
            Age
          </Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            className="bg-gray-200 border-0  h-10 text-gray-900"
            placeholder="Enter your age"
            min="1"
            max="120"
          />
        </div>

        {/* Contact Number Field */}
        <div className="space-y-2">
          <Label htmlFor="contactNumber" className="text-gray-700 font-bold">
            Contact Number
          </Label>
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            className="bg-gray-200 border-0 h-10 text-gray-900"
            placeholder="Enter your contact number"
          />
        </div>

        {/* Classification Field */}
        <div className="space-y-2">
          <Label htmlFor="classification" className="text-gray-700 font-bold">
            Classification
          </Label>
          <Select
            value={formData.classification}
            onValueChange={(value) => handleInputChange("classification", value)}
          >
            <SelectTrigger className="bg-gray-200 border-0 h-10 text-gray-900">
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="PWD">PWD</SelectItem>
              <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ID Verification Notice */}
        {requiresIdVerification && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-600 text-sm">
              **If Student, PWDs, or Senior Citizen, please present your ID at the counter.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={!isFormValid()}
            className="w-full  bg-blue-800 hover:bg-blue-900 text-white rounded-lg h-12 font-medium disabled:opacity-50"
          >
            Save and Continue
          </Button>
        </div>
      </form>
    </div>
  )
}
