"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Route, Filter, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import CreateRouteModal from "@/components/modals/createRoute"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type RouteData = {
  id: number
  name: string
  origin: string
  destination: string
}

export default function ManageRouteDash() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/admin/routes")
      if (!res.ok) throw new Error("Failed to fetch routes")
      const data = await res.json()
      setRoutes(data)
    } catch (error) {
      console.error("Failed to fetch routes:", error)
      toast.error("Failed to fetch routes")
    } finally {
      setLoading(false)
    }
  }

  const deleteRoute = async (routeId: number) => {
    setDeletingId(routeId)
    try {
      const res = await fetch(`/api/admin/routes?id=${routeId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete route")
      }

      // Remove the route from the local state
      setRoutes(routes.filter((route) => route.id !== routeId))
      toast.success("Route deleted successfully")
    } catch (error) {
      console.error("Error deleting route:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete route")
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Route className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Manage Routes</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-8 bg-[rgba(219,234,254,0.3)]">
          <div className="mb-4">
            <p className="text-gray-600">Create new routes</p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <CreateRouteModal />
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Routes Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <p className="p-4 text-gray-600">Loading routes...</p>
                ) : routes.length === 0 ? (
                  <p className="p-4 text-gray-500">No routes found</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Route Name</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Origin</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Destination</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route) => (
                        <tr
                          key={route.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 text-gray-900">{route.name}</td>
                          <td className="py-4 px-6 text-gray-900">{route.origin}</td>
                          <td className="py-4 px-6 text-gray-900">{route.destination}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                title="Edit route"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                    disabled={deletingId === route.id}
                                    title="Delete route"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Route</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this route? This action cannot be undone.
                                      <br />
                                      <br />
                                      <strong>Route Details:</strong>
                                      <br />
                                      Name: {route.name}
                                      <br />
                                      Origin: {route.origin}
                                      <br />
                                      Destination: {route.destination}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRoute(route.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={deletingId === route.id}
                                    >
                                      {deletingId === route.id ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
