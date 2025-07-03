"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Filter, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import CreateVanModal from "@/components/modals/createVan";
import { toast } from "sonner";
import type { VanWithRoute } from "@/lib/types";

export default function ManageVan() {
  const [vans, setVans] = useState<VanWithRoute[]>([]);

  async function fetchVans() {
    try {
      const res = await fetch("/api/admin/vans");
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid van data");
      }

      setVans(data);
    } catch (err) {
      console.error("Failed to fetch vans", err);
      toast.error("Failed to load vans");
    }
  }

  useEffect(() => {
    fetchVans();
  }, []);

  async function handleDeleteVan(id: number) {
    if (!confirm("Are you sure you want to delete this van?")) return;
    try {
      const res = await fetch(`/api/van/${id}/route`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Van deleted successfully");
      fetchVans();
    } catch (err) {
      console.error("Error deleting van", err);
      toast.error("Failed to delete van");
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage your van
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          <div className="mb-4">
            <p className="text-gray-600">
              Add, edit, and manage your van fleet
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <CreateVanModal onCreated={fetchVans} />
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Van Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Plate Number
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Model
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Capacity
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Route
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vans.map((van, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 text-gray-900">{van.plateNumber}</td>
                        <td className="py-4 px-6 text-gray-900">{van.model}</td>
                        <td className="py-4 px-6 text-gray-900">{van.capacity} seats</td>
                        <td className="py-4 px-6 text-gray-900">
                          {van.route?.name || "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteVan(van.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
