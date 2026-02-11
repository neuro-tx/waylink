"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  LayoutDashboard,
  Users,
  Map,
  CalendarCheck,
  CreditCard,
  Shield,
  ImageIcon,
  LucideIcon,
  Package,
  Repeat,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

export type AdminNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  iconColor? :string;
  exact?:boolean;
};

export const adminNav: AdminNavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    iconColor:"text-green-500",
    exact: true
  },
  {
    title: "Trips",
    url: "/admin/trips",
    icon: Map,
    iconColor: "text-cyan-500"
  },
  {
    title: "Bookings",
    url: "/admin/bookings",
    icon: CalendarCheck,
    iconColor: "text-indigo-500"
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    iconColor:"text-pink-500"
  },
  {
    title: "Billing",
    url: "/admin/billing",
    icon: CreditCard,
    iconColor:"text-fuchsia-500"
  },
  {
    title: "Media",
    url: "/admin/media",
    icon: ImageIcon,
    iconColor:"text-yellow-500"
  },
  {
    title: "Plans",
    url: "/admin/plans",
    icon: Package,
    iconColor: "text-red-500"
  },
  {
    title: "Subscriptions",
    url: "/admin/subscriptions",
    icon: Repeat,
    iconColor: "text-purple-500"
  },
  {
    title: "Roles & Permissions",
    url: "/admin/roles",
    icon: Shield,
    iconColor:"text-emerald-500"
  },
];

const user = {
  name: "neuro-tx",
  email: "neuro@gmail.com",
  avatar: "/avatar.jpg",
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <Link
            href="/"
            className="w-full flex items-center transition border-b select-none"
          >
            <Image
              src="/icons/logo-alt.svg"
              alt="waylink-icon"
              width={50}
              height={50}
            />
            <div className="space-x-1 ml-1.5 font-bold text-2xl">
              <span className="text-blue-20">WAY</span>
              <span className="text-orange-1">LINK</span>
            </div>
          </Link>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
