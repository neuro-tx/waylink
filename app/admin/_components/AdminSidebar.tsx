"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  LucideIcon,
  Package,
  PieChart,
  BellPlus,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

export type AdminNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  iconColor?: string;
  exact?: boolean;
};

export const adminNav: AdminNavItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    iconColor: "text-rose-500",
    exact: true,
  },
  {
    title: "Analytics",
    url: "/admin/nnalytics",
    icon: PieChart,
    iconColor: "text-green-500",
  },
  {
    title: "Products Moderation",
    url: "/admin/products_moderation",
    icon: SlidersHorizontal,
    iconColor: "text-cyan-500",
  },
  {
    title: "Provider Management",
    url: "/admin/provider_management",
    icon: Users,
    iconColor: "text-pink-500",
  },
  {
    title: "Notification Center",
    url: "/admin/notification_center",
    icon: BellPlus,
    iconColor: "text-yellow-500",
  },
  {
    title: "Plans",
    url: "/admin/plans",
    icon: Package,
    iconColor: "text-red-500",
  },
  {
    title: "Subscriptions",
    url: "/admin/subscriptions",
    icon: Layers,
    iconColor: "text-purple-500",
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setOpen(e.matches);
    };

    handler(mq);

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <Link
            href="/admin"
            className="w-full h-15 flex items-center transition border-b select-none"
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
