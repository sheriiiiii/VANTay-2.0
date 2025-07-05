"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateTripModalProps {
  trigger?: React.ReactNode
  onTripCreated?: () => void
}

interface Van {
  id: number
  plateNumber: string
  capacity: number
}

interface Route {
  id: number
  name: string
}

const TRIP_STATUSES = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "BOARDING", label: "Boarding" },
  { value: "DEPARTED", label: "Departed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default function CreateTripModal({ trigger, onTripCreated }: CreateTripModalProps) {
  const [open, setOpen] = useState(false)
  const [vans, setVans] = useState<Van[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [formData, setFormData] = useState({
    vanId: "",
    routeId: "",
    tripDate: "",
    availableSeats: "",
    driverName: "",
    driverPhone: "",
    status: "SCHEDULED",
  })

  // Fetch vans and routes
  useEffect(() => {
    const fetchData = async () => {
      const vanRes = await fetch("/api/admin/vans")
      const routeRes = await fetch("/api/admin/routes")
      if (vanRes.ok) setVans(await vanRes.json())
      if (routeRes.ok) setRoutes(await routeRes.json())
    }
    fetchData()
  }, [])

  // Auto-fill available seats from selected van
  useEffect(() => {
    const selectedVan = vans.find((v) => v.id.toString() === formData.vanId)
    if (selectedVan) {
      setFormData((prev) => ({
        ...prev,
        availableSeats: selectedVan.capacity.toString(),
      }))
    }
  }, [formData.vanId, vans])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/admin/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vanId: Number.parseInt(formData.vanId),
        routeId: Number.parseInt(formData.routeId),
        tripDate: formData.tripDate,
        availableSeats: Number.parseInt(formData.availableSeats),
        driverName: formData.driverName || undefined,
        driverPhone: formData.driverPhone || undefined,
        status: formData.status,
      }),
    })

    if (res.ok) {
      setOpen(false)
      onTripCreated?.()
      setFormData({
        vanId: "",
        routeId: "",
        tripDate: "",
        availableSeats: "",
        driverName: "",
        driverPhone: "",
        status: "SCHEDULED",
      })
    } else {
      const errorData = await res.json()
      alert(errorData.error || "Failed to create trip")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full">Add New Trip</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Create Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Van dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Van</Label>
            <Select onValueChange={(value) => handleInputChange("vanId", value)} value={formData.vanId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a van" />
              </SelectTrigger>
              <SelectContent>
                {vans.map((van) => (
                  <SelectItem key={van.id} value={van.id.toString()}>
                    {van.plateNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Route dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Route</Label>
            <Select onValueChange={(value) => handleInputChange("routeId", value)} value={formData.routeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trip Date */}
          <div className="space-y-2">
            <Label htmlFor="tripDate" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="tripDate"
              type="date"
              value={formData.tripDate}
              onChange={(e) => handleInputChange("tripDate", e.target.value)}
              required
            />
          </div>

          {/* Available Seats - auto-filled, readonly */}
          <div className="space-y-2">
            <Label htmlFor="availableSeats" className="text-sm font-medium text-gray-700">
              Available Seats
            </Label>
            <Input
              id="availableSeats"
              type="number"
              value={formData.availableSeats}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select onValueChange={(value) => handleInputChange("status", value)} value={formData.status} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {TRIP_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Driver Name */}
          <div className="space-y-2">
            <Label htmlFor="driverName" className="text-sm font-medium text-gray-700">
              Driver Name (Optional)
            </Label>
            <Input
              id="driverName"
              value={formData.driverName}
              onChange={(e) => handleInputChange("driverName", e.target.value)}
            />
          </div>

          {/* Driver Phone */}
          <div className="space-y-2">
            <Label htmlFor="driverPhone" className="text-sm font-medium text-gray-700">
              Driver Phone (Optional)
            </Label>
            <Input
              id="driverPhone"
              value={formData.driverPhone}
              onChange={(e) => handleInputChange("driverPhone", e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg mt-6">
            Create Trip
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
