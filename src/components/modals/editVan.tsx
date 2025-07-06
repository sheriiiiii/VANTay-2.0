"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { VanWithRoute, Route, VanStatus } from "@/lib/types"

interface EditVanModalProps {
  van: VanWithRoute | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

const VAN_STATUSES: { value: VanStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "INACTIVE", label: "Inactive" },
]

const FIXED_CAPACITY = 13

export default function EditVanModal({ van, open, onOpenChange, onUpdated }: EditVanModalProps) {
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: FIXED_CAPACITY.toString(),
    routeId: "",
    status: "ACTIVE" as VanStatus,
  })
  const [routes, setRoutes] = useState<Route[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when van changes
  useEffect(() => {
    if (van) {
      setFormData({
        plateNumber: van.plateNumber || "",
        model: van.model || "",
        capacity: FIXED_CAPACITY.toString(),
        routeId: van.route?.id?.toString() || "",
        status: (van.status as VanStatus) || "ACTIVE",
      })
    }
  }, [van])

  // Fetch routes when modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/admin/routes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setRoutes(data)
          } else {
            throw new Error("Invalid routes")
          }
        })
        .catch((err) => {
          console.error("Failed to fetch routes", err)
          toast.error("Failed to load routes")
        })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!van) return

    if (!formData.plateNumber || !formData.model || !formData.routeId || !formData.status) {
      toast.error("Please complete all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/vans/${van.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateNumber: formData.plateNumber,
          model: formData.model,
          capacity: FIXED_CAPACITY,
          routeId: Number(formData.routeId),
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update van")
      }

      toast.success("Van updated successfully!")
      onOpenChange(false)
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Error updating van")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!van) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Van</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              value={formData.plateNumber}
              onChange={(e) => handleInputChange("plateNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={FIXED_CAPACITY}
              readOnly
              className="bg-gray-50 text-gray-600 cursor-not-allowed"
              title="Capacity is fixed at 13 seats for all vans"
            />
            <p className="text-xs text-gray-500">All vans have a fixed capacity of 13 seats</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="routeId">Route</Label>
            <Select value={formData.routeId} onValueChange={(value) => handleInputChange("routeId", value)}>
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
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {VAN_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-slate-800 text-white py-2 rounded-lg mt-6"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating...
              </>
            ) : (
              "Update Van"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
