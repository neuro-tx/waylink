"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Star,
  BarChart3,
  Settings,
  Bell,
  LucideIcon,
  HelpCircle,
  CreditCard,
  Layers,
  Cog,
  Loader2,
  User,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useProviderContext } from "../../../components/providers/ProviderContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./GlobalSearch";
import { authClient } from "@/lib/auth-client";
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

interface NavChild {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  children?: NavChild[];
}

export function ProviderSidebar() {
  const pathname = usePathname();
  const { type, config, provider } = useProviderContext();
  const { setOpen } = useSidebar();

  const isActive = (href: string): boolean =>
    pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setOpen(e.matches);
    };

    handler(mq);

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const initials =
    provider.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PR";

  const NAV_MAIN: NavItem[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/provider",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/provider/analytics",
    },
    {
      title: "Bookings",
      icon: CalendarDays,
      href: "/provider/bookings",
    },
    {
      title: "Customers",
      icon: Users,
      href: "/provider/customers",
    },
    {
      title: "Reviews",
      icon: Star,
      href: "/provider/reviews",
    },
    {
      title: "Subscription",
      icon: Layers,
      href: "/provider/subscription",
    },
    {
      title: "Plans",
      icon: Cog,
      href: "/provider/plans",
    },
  ];

  const NAV_ACCOUNT: NavItem[] = [
    {
      title: "Billing",
      icon: CreditCard,
      href: "/provider/billing",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/provider/settings",
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      href: "/provider/support",
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
          className={`
            group relative transition-all duration-150
            hover:bg-sidebar-accent/60
            ${active ? `bg-sidebar-accent ${config.twTextColor} font-medium` : "text-muted-foreground hover:text-foreground"}
          `}
        >
          <Link href={item.href} className="flex items-center gap-3">
            {active && (
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.75 rounded-r-full ${config.twBgColor}`}
              />
            )}
            <item.icon
              className={`size-4 shrink-0 transition-colors ${
                active
                  ? config.twTextColor
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span className="flex-1 truncate text-sm">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 overflow-x-hidden"
    >
      <SidebarHeader className="border-b border-border/40 h-17 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/provider" className="flex items-center gap-3">
                <Image
                  src="/icons/logo-alt.svg"
                  alt="WayLink logo"
                  width={50}
                  height={50}
                />
                <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-base tracking-tight">
                    WayLink
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {type} Provider
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2 flex flex-col gap-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>
          <SidebarMenu>{NAV_MAIN.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>

        <div className="mx-3 border-t border-border/30 group-data-[collapsible=icon]:mx-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 group-data-[collapsible=icon]:hidden">
            Account
          </SidebarGroupLabel>
          <SidebarMenu>{NAV_ACCOUNT.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent hover:bg-sidebar-accent/60 transition-colors"
                >
                  <Avatar className="size-9 rounded-full shrink-0">
                    <AvatarImage src={provider?.logo ?? "/avatar.jpg"} />
                    <AvatarFallback
                      className={`rounded-full font-semibold text-xs ${config.twLightBg} ${config.twTextColor}`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col leading-tight min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">
                      {provider.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {type} Partner
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function ProviderHeader() {
  const { type, config, user } = useProviderContext();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const logout = () => {
    startTransition(async () => {
      try {
        router.replace("/");

        setTimeout(async () => {
          await authClient.signOut();
          toast.success("Signed out successfully!");
        }, 50);
      } catch (err: any) {
        toast.error(err?.message || "Failed to log out");
      }
    });
  };

  const initials =
    user.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 flex h-17 w-full items-center justify-between border-b px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm logout</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll be logged out and. You can sign in again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={logout} disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </span>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors shrink-0" />

        <div className="flex items-center gap-1 text-sm whitespace-nowrap">
          <span className="text-muted-foreground capitalize">{type}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">
            {config.sidebarServiceLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <GlobalSearch />

        <Button size="icon" variant="ghost" className="relative">
          <Bell className="size-4" />
          <span
            className={`absolute top-1.5 right-1.5 size-1.5 rounded-full ${config.twBgColor}`}
          />
        </Button>
        <ThemeToggle />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="size-8 cursor-pointer">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback
                    className={`text-xs font-semibold ${config.twLightBg} ${config.twTextColor}`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 flex items-center gap-2">
                <Avatar className="size-8 cursor-pointer">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback
                    className={`text-xs font-semibold ${config.twLightBg} ${config.twTextColor}`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/account">
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <LogOut className="text-red-600" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
