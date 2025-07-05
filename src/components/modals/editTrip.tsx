"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Trip {
  id: number
  tripDate: string
  availableSeats: number
  driverName?: string
  driverPhone?: string
  van: {
    id: number
    plateNumber: string
    capacity: number
  }
  route: {
    id: number
    name: string
  }
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

interface EditTripModalProps {
  trip: Trip | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export default function EditTripModal({ trip, open, onOpenChange, onUpdated }: EditTripModalProps) {
  const [vans, setVans] = useState<Van[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [formData, setFormData] = useState({
    vanId: "",
    routeId: "",
    tripDate: "",
    availableSeats: "",
    driverName: "",
    driverPhone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when trip changes
  useEffect(() => {
    if (trip) {
      setFormData({
        vanId: trip.van.id.toString(),
        routeId: trip.route.id.toString(),
        tripDate: new Date(trip.tripDate).toISOString().split("T")[0],
        availableSeats: trip.availableSeats.toString(),
        driverName: trip.driverName || "",
        driverPhone: trip.driverPhone || "",
      })
    }
  }, [trip])

  // Fetch vans and routes when modal opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [vanRes, routeRes] = await Promise.all([fetch("/api/admin/vans"), fetch("/api/admin/routes")])

          if (vanRes.ok) {
            const vansData = await vanRes.json()
            setVans(vansData)
          }
          if (routeRes.ok) {
            const routesData = await routeRes.json()
            setRoutes(routesData)
          }
        } catch (error) {
          console.error("Failed to fetch data:", error)
          toast.error("Failed to load vans and routes")
        }
      }
      fetchData()
    }
  }, [open])

  // Auto-fill available seats from selected van (read-only behavior)
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

    if (!trip) return

    if (!formData.vanId || !formData.routeId || !formData.tripDate || !formData.availableSeats) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trip.id,
          vanId: Number.parseInt(formData.vanId),
          routeId: Number.parseInt(formData.routeId),
          tripDate: formData.tripDate,
          availableSeats: Number.parseInt(formData.availableSeats),
          driverName: formData.driverName || undefined,
          driverPhone: formData.driverPhone || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update trip")
      }

      toast.success("Trip updated successfully!")
      onOpenChange(false)
      if (onUpdated) onUpdated()
    } catch (error) {
      console.error("Error updating trip:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update trip")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    if (trip) {
      setFormData({
        vanId: trip.van.id.toString(),
        routeId: trip.route.id.toString(),
        tripDate: new Date(trip.tripDate).toISOString().split("T")[0],
        availableSeats: trip.availableSeats.toString(),
        driverName: trip.driverName || "",
        driverPhone: trip.driverPhone || "",
      })
    }
  }

  // Get the selected van for display purposes
  const selectedVan = vans.find((v) => v.id.toString() === formData.vanId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Van dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Van</Label>
            <Select
              onValueChange={(value) => handleInputChange("vanId", value)}
              value={formData.vanId}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a van" />
              </SelectTrigger>
              <SelectContent>
                {vans.map((van) => (
                  <SelectItem key={van.id} value={van.id.toString()}>
                    {van.plateNumber} ({van.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Route dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Route</Label>
            <Select
              onValueChange={(value) => handleInputChange("routeId", value)}
              value={formData.routeId}
              disabled={isSubmitting}
              required
            >
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
            <Label htmlFor="edit-tripDate" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="edit-tripDate"
              type="date"
              value={formData.tripDate}
              onChange={(e) => handleInputChange("tripDate", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Available Seats - READ ONLY */}
          <div className="space-y-2">
            <Label htmlFor="edit-availableSeats" className="text-sm font-medium text-gray-700">
              Available Seats
              {selectedVan && <span className="text-xs text-gray-500 ml-2">(Auto-filled from van capacity)</span>}
            </Label>
            <Input
              id="edit-availableSeats"
              type="number"
              value={formData.availableSeats}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500"> Seats are automatically set based on the selected van capacity</p>
          </div>

          {/* Driver Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-driverName" className="text-sm font-medium text-gray-700">
              Driver Name (Optional)
            </Label>
            <Input
              id="edit-driverName"
              value={formData.driverName}
              onChange={(e) => handleInputChange("driverName", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Driver Phone */}
          <div className="space-y-2">
            <Label htmlFor="edit-driverPhone" className="text-sm font-medium text-gray-700">
              Driver Phone (Optional)
            </Label>
            <Input
              id="edit-driverPhone"
              value={formData.driverPhone}
              onChange={(e) => handleInputChange("driverPhone", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                "Update Trip"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
