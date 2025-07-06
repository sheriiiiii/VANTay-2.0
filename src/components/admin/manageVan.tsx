"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Filter, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import CreateVanModal from "@/components/modals/createVan";
import EditVanModal from "@/components/modals/editVan";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { VanWithRoute } from "@/lib/types";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "MAINTENANCE":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        };
      case "INACTIVE":
        return {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100",
        };
      default:
        return { variant: "outline" as const, className: "" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}

export default function ManageVan() {
  const [vans, setVans] = useState<VanWithRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vanToDelete, setVanToDelete] = useState<VanWithRoute | null>(null);
  const [editingVan, setEditingVan] = useState<VanWithRoute | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  async function fetchVans() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/vans");
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid van data");
      }
      setVans(data);
    } catch (err) {
      console.error("Failed to fetch vans", err);
      toast.error("Failed to load vans");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteVan(van: VanWithRoute) {
    console.log("🧪 [DeleteVan] Deleting van ID:", van.id);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/vans/${van.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      toast.success("Van deleted successfully");
      setDeleteDialogOpen(false);
      setVanToDelete(null);
      fetchVans();
    } catch (err) {
      console.error("Error deleting van:", err);
      toast.error("Failed to delete van");
    } finally {
      setIsDeleting(false);
    }
  }

  function openDeleteDialog(van: VanWithRoute) {
    setVanToDelete(van);
    setDeleteDialogOpen(true);
  }

  function handleEditVan(van: VanWithRoute) {
    setEditingVan(van);
    setEditModalOpen(true);
  }

  function handleVanUpdated() {
    fetchVans(); // Refresh the vans list
  }

  useEffect(() => {
    fetchVans();
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-r bg-white px-4 py-10 shadow-xl z-50">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Bus className="h-5 w-5 text-black" />
            <h1 className="text-[16px] font-semibold text-black">
              Manage your van fleet
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
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
              >
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
                    <tr className="border-b border-gray-200 justify-center text-center">
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
                        Available Route
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                            <span>Loading vans...</span>
                          </div>
                        </td>
                      </tr>
                    ) : vans.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No vans found. Create your first van to get started.
                        </td>
                      </tr>
                    ) : (
                      vans.map((van) => (
                        <tr
                          key={van.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 text-gray-900">
                            {van.plateNumber}
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {van.model}
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {van.capacity} seats
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {van.route?.name || "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={van.status || "ACTIVE"} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEditVan(van)}
                                title="Edit van"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                onClick={() => openDeleteDialog(van)}
                                title="Delete van"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Van Modal */}
        <EditVanModal
          van={editingVan}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdated={handleVanUpdated}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Van</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <div>
                    Are you sure you want to delete van{" "}
                    <strong>{vanToDelete?.plateNumber}</strong>?
                  </div>
                  {vanToDelete && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md space-y-1">
                      <div>
                        <strong>Model:</strong> {vanToDelete.model}
                      </div>
                      <div>
                        <strong>Capacity:</strong> {vanToDelete.capacity} seats
                      </div>
                      <div>
                        <strong>Route:</strong>{" "}
                        {vanToDelete.route?.name || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <StatusBadge status={vanToDelete.status || "ACTIVE"} />
                      </div>
                    </div>
                  )}
                  <div className="text-red-600 font-medium">
                    This action cannot be undone. All associated seats and past
                    trips will also be deleted.
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => vanToDelete && handleDeleteVan(vanToDelete)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Van
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
