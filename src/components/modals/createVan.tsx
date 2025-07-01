"use client";

import type React from "react";
import { useState } from "react";
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

interface CreateVanModalProps {
  trigger?: React.ReactNode;
}

export default function CreateVanModal({ trigger }: CreateVanModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    route: "",
    driver: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating van:", formData);
    setOpen(false);
    // Reset form
    setFormData({
      plateNumber: "",
      model: "",
      capacity: "",
      route: "",
      driver: "",
    });
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
            <Label
              htmlFor="plateNumber"
              className="text-sm font-medium text-gray-700"
            >
              Plate Number
            </Label>
            <Input
              id="plateNumber"
              placeholder="ABC - 123"
              value={formData.plateNumber}
              onChange={(e) => handleInputChange("plateNumber", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="model"
              className="text-sm font-medium text-gray-700"
            >
              Model
            </Label>
            <Input
              id="model"
              placeholder="Toyota"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="capacity"
              className="text-sm font-medium text-gray-700"
            >
              Capacity
            </Label>
            <Input
              id="capacity"
              placeholder="15 seats"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="route"
              className="text-sm font-medium text-gray-700"
            >
              Route
            </Label>
            <Input
              id="route"
              placeholder="Iloilo - Antique"
              value={formData.route}
              onChange={(e) => handleInputChange("route", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="driver"
              className="text-sm font-medium text-gray-700"
            >
              Driver
            </Label>
            <Input
              id="driver"
              placeholder="Wilson Ang"
              value={formData.driver}
              onChange={(e) => handleInputChange("driver", e.target.value)}
              className="w-full"
              required
            />
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
