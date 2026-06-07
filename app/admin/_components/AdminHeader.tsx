"use client";

import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell, Settings, LayoutDashboard, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const quickActions = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    url: "/admin",
  },
  {
    icon: Users,
    label: "Manage Users",
    url: "/admin/users",
  },
  {
    icon: Bell,
    label: "Notifications",
    mark: true,
    url: "/admin/notifications",
  },
];

const AdminHeader = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-999">
        <div className="absolute inset-0 border-b border-border/60 bg-background/80 backdrop-blur-md" />

        <div className="relative flex h-17 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-md bg-green-500/15 ring-1 ring-green-500/20">
              <Shield className="size-5 text-green-500" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-base font-semibold tracking-tight text-foreground">
                Admin Console
              </span>
              {user?.role && (
                <div className="hidden sm:inline-flex px-3 py-0.5 capitalize border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full text-sm">
                  {user.role}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {quickActions.map(({ icon: Icon, label, url, mark }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground hidden sm:flex"
                    onClick={() => router.push(url)}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                    {mark && (
                      <span className="absolute right-0.5 top-0.5 flex size-2.25 aspect-square rounded-full bg-blue-10 dark:bg-blue-20" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}

            <SidebarTrigger className="size-9 lg:hidden inline-flex text-muted-foreground hover:text-foreground transition-colors shrink-0" />

            <div className="mx-1.5 h-5 w-px bg-border" />

            <ThemeToggle />

            <div className="mx-1.5 h-5 w-px bg-border" />

            {!loading && user && (
              <Avatar>
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            )}

            {loading && (
              <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default AdminHeader;
