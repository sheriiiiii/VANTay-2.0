"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Route, Filter, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/sidebar/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import CreateRouteModal from "@/components/modals/createRoute";

type RouteData = {
  id: number
  name: string
  origin: string
  destination: string
}

export default function ManageRouteDash() {
  const [routes, setRoutes] = useState<RouteData[]>([])

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch("/api/admin/routes")
        const data = await res.json()
        setRoutes(data)
      } catch (err) {
        console.error("Failed to fetch routes:", err)
      }
    }

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
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Routes
            </h1>
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

          {/* Routes Table */}
          <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl border-0">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Route Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Origin
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Destination
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
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
  )
}
