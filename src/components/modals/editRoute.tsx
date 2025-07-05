"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

type RouteData = {
  id: number
  name: string
  origin: string
  destination: string
}

interface EditRouteModalProps {
  route: RouteData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export default function EditRouteModal({ route, open, onOpenChange, onUpdated }: EditRouteModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when route changes
  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
      })
    }
  }, [route])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!route) return

    const { name, origin, destination } = formData

    if (!name || !origin || !destination) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/admin/routes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: route.id,
          name,
          origin,
          destination,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update route")
      }

      toast.success("Route updated successfully!")
      onOpenChange(false)
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Error updating route")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form data when closing
    if (route) {
      setFormData({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Route Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Iloilo - San Jose"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="edit-origin">Origin</Label>
            <Input
              id="edit-origin"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              placeholder="e.g. Iloilo"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="edit-destination">Destination</Label>
            <Input
              id="edit-destination"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              placeholder="e.g. San Jose"
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating..." : "Update Route"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
