"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bus,
  Ticket,
  Users,
  User,
  LogOut,
  Settings,
  Route,
  MapPinned, 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigationItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Routes", href: "/admin/dashboard/manage-route", icon: Route },
    { name: "Vans", href: "/admin/dashboard/manage-van", icon: Bus },
    { name: "Trips", href: "/admin/dashboard/manage-trip", icon: MapPinned },
    { name: "Seats", href: "/admin/dashboard/manage-seat", icon: Users },
    { name: "Tickets", href: "/admin/dashboard/manage-ticket", icon: Ticket },
  ];

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "Admin";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Sidebar className="border-r bg-white shadow-lg z-30 w-64">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg tracking-wider">
              V
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              VANTAY
            </div>
            <div className="font-semibold text-gray-900">Welcome Admin</div>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-gray-500 uppercase tracking-wide px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200 hover:bg-blue-50 hover:text-blue-600",
                        isActive && "bg-blue-100 text-blue-600 font-medium"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3.5 px-3 py-2.5">
  <div
    className={cn(
      "p-2 rounded-md transition-all",
      isActive ? "bg-white text-blue-600 shadow" : "text-gray-600"
    )}
  >
    <Icon className="h-6 w-6" />
  </div>
  <span className="text-base font-medium">{item.name}</span>
</Link>

                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Account Footer */}
      <SidebarFooter className="border-t border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer flex items-center justify-between w-full px-3 py-2 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-medium">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="start"
                className="w-48 mt-2 ml-3 shadow-md"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-2 text-sm"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
