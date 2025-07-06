"use client";

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
import { toast } from "sonner";

interface CreateRouteModalProps {
  onCreated?: () => void;
}

export default function CreateRouteModal({ onCreated }: CreateRouteModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, origin, destination } = formData;

    if (!name || !origin || !destination) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create route");

      toast.success("Route created successfully!");
      setOpen(false);
      setFormData({ name: "", origin: "", destination: "" });
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      toast.error("Error creating route");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-slate-800 text-white px-6 py-2 rounded-xl">
          Add Route
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Route Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Iloilo - San Jose"
            />
          </div>
          <div>
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              placeholder="e.g. Iloilo"
            />
          </div>
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
              placeholder="e.g. San Jose"
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-4 flex- bg-cyan-600 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Create Route
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
