"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    iconColor?: string;
  }[];
}) {
  const path = usePathname();
  const isActive = (url: string) => path === url;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "font-medium flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                "transition-all duration-300",
                isActive(item.url)
                  ? "bg-blue-10 dark:bg-blue-20 text-background"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.icon && <item.icon className={cn("w-5 h-5" ,isActive(item.url) ? "text-white": item.iconColor)} />}
              <span>{item.title}</span>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
