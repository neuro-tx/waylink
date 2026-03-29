"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Heart,
  BookMarked,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Profile", href: "/account", icon: User, accent: "#00C9A7" },
  {
    label: "Notifications",
    href: "/account/notifications",
    icon: Bell,
    accent: "#FF6B35",
  },
  {
    label: "My Bookings",
    href: "/account/bookings",
    icon: BookMarked,
    accent: "#845EF7",
  },
  {
    label: "Wishlist",
    href: "/account/wish-list",
    icon: Heart,
    accent: "#ef4444",
  },
  {
    label: "Explore Page",
    href: "/",
    icon: Home,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-2.25 border-b">
        <Link
          href="/account"
          className="w-full flex items-center transition select-none"
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
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
              style={
                active
                  ? {
                      background: `${item.accent}14`,
                      color: item.accent,
                    }
                  : {}
              }
            >
              <span
                className={cn(
                  "shrink-0 w-0.5 h-5 rounded-full transition-all duration-200",
                  active ? "opacity-100" : "opacity-0",
                )}
                style={{ background: item.accent }}
              />

              <span
                className="w-8 h-8 flex items-center justify-center rounded-xl shrink-0 transition-all duration-200"
                style={
                  active
                    ? { background: `${item.accent}20`, color: item.accent }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
              </span>

              <span className="flex-1">{item.label}</span>

              {active && (
                <ChevronRight
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: item.accent }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
      startTransition(async () => {
        await logout();
      });
    };

  const currentPage = NAV_ITEMS.find((n) => n.href === pathname);
  const currentAccent = currentPage?.accent ?? "#3b82f6";
  const currentLabel = currentPage?.label ?? "Profile";

  return (
    <div className="min-h-screen font-sans flex">
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm logout</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll be logged out and. You can sign in again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Logging out...
                </span>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border/70 bg-card/60 backdrop-blur-xl sticky top-0 h-screen">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-2xl"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-border/80 backdrop-blur-lg">
          <div className="p-4 px-4 md:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer lg:hidden"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: currentAccent }}
                />
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  {currentLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
