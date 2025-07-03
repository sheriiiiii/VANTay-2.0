"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateVanModalProps {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export default function CreateVanModal({ trigger, onCreated }: CreateVanModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    routeId: "",
  });

  const [routes, setRoutes] = useState<{ id: number; name: string }[]>([]);

  // Fetch routes when modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/admin/routes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setRoutes(data);
          } else {
            throw new Error("Invalid routes");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch routes", err);
          toast.error("Failed to load routes");
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const capacity = parseInt(formData.capacity);

    if (
      !formData.plateNumber ||
      !formData.model ||
      isNaN(capacity) ||
      !formData.routeId
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/admin/vans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plateNumber: formData.plateNumber,
          model: formData.model,
          capacity,
          routeId: Number(formData.routeId),
        }),
      });

      if (!response.ok) throw new Error("Failed to create van");

      toast.success("Van created successfully!");
      setOpen(false);
      setFormData({
        plateNumber: "",
        model: "",
        capacity: "",
        routeId: "",
      });

      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      toast.error("Error creating van");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full">
            Add New Van
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create Van
          </DialogTitle>
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
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeId">Route</Label>
            <select
              id="routeId"
              value={formData.routeId}
              onChange={(e) => handleInputChange("routeId", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg mt-6"
          >
            Create Van
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
