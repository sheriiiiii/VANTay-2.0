"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bus,
  Plus,
  Ticket,
  Users,
  User,
  LogOut,
  Settings,
  Route,
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
    { name: "Manage Van", href: "/admin/dashboard/manage-van", icon: Bus },
    { name: "Create Trip", href: "/admin/dashboard/manage-trip", icon: Plus },
    {
      name: "Manage Tickets",
      href: "/admin/dashboard/manage-ticket",
      icon: Ticket,
    },
    { name: "Manage Seat", href: "/admin/dashboard/manage-seat", icon: Users },
    { name: "Manage Route", href: "/admin/dashboard/manage-route", icon: Route },
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
    <Sidebar className="border-r border-gray-100 bg-white shadow-xl z-30">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-gray-500 uppercase tracking-wide">
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
                        "transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600",
                        isActive && "bg-blue-100 text-blue-600 font-medium"
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{displayName}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="start"
                className="w-48 mt-2 ml-3"
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
