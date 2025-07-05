"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { VanWithRoute } from "@/lib/types"

interface EditVanModalProps {
  van: VanWithRoute | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export default function EditVanModal({ van, open, onOpenChange, onUpdated }: EditVanModalProps) {
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    routeId: "",
  })
  const [routes, setRoutes] = useState<{ id: number; name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when van changes
  useEffect(() => {
    if (van) {
      setFormData({
        plateNumber: van.plateNumber,
        model: van.model,
        capacity: van.capacity.toString(),
        routeId: van.route?.id?.toString() || "",
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

    const capacity = Number.parseInt(formData.capacity)
    if (!formData.plateNumber || !formData.model || isNaN(capacity) || !formData.routeId) {
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
          capacity,
          routeId: Number(formData.routeId),
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

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    if (van) {
      setFormData({
        plateNumber: van.plateNumber,
        model: van.model,
        capacity: van.capacity.toString(),
        routeId: van.route?.id?.toString() || "",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Edit Van</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-plateNumber">Plate Number</Label>
            <Input
              id="edit-plateNumber"
              value={formData.plateNumber}
              onChange={(e) => handleInputChange("plateNumber", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Input
              id="edit-model"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-capacity">Capacity</Label>
            <Input
              id="edit-capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-routeId">Route</Label>
            <select
              id="edit-routeId"
              value={formData.routeId}
              onChange={(e) => handleInputChange("routeId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              required
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
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
                "Update Van"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
