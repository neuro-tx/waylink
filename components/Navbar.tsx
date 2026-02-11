"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Bell,
  LogOut,
  Heart,
  Menu,
  X,
  BookMarked,
  Loader,
} from "lucide-react";
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

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "./providers/AuthProvider";
import { useClickOutside } from "@/hooks/useClickOut";

const links = {
  navMain: [
    { title: "Explore", href: "/" },
    { title: "Transports", href: "/transport" },
    { title: "Trips", href: "/trips" },
    { title: "Most Rating", href: "/most-rating" },
  ],

  dropMenu: [
    {
      title: "Account",
      icon: User,
      href: "/account",
      color: "text-blue-500",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
      color: "text-amber-400",
    },
    {
      title: "My Bookings",
      icon: BookMarked,
      href: "/bookings",
      color: "text-green-500",
    },
    {
      title: "My List",
      icon: Heart,
      href: "/wish-list",
      color: "text-red-500",
    },
  ],
};

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user, isAuthenticated, logout, loading, openModal } = useAuth();
  const menuRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (route: string) => pathname === route;

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  useClickOutside(menuRef ,()=> {
    setOpen(false);
  } ,[toggleButtonRef])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-transparent backdrop-blur-xs">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
      <div className="container mx-auto px-3 lg:px-5 xl:px-6 relative">
        <div className="w-full flex h-16 items-center justify-between">
          <Link href="/" className="select-none">
            <Image
              src="/icons/logo.svg"
              alt="waylink-icon"
              width={180}
              height={70}
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.navMain.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all",

                  "text-muted-foreground hover:text-foreground hover:bg-accent/50",

                  isActive(i.href) && "text-primary bg-accent",
                )}
              >
                {i.title}
                {isActive(i.href) && (
                  <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {/* Mobile menu toggle */}
              <Button
                onClick={() => setOpen(!open)}
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer md:hidden"
                ref={toggleButtonRef}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </Button>

              {loading && (
                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse md:block" />
              )}

              {!loading && !isAuthenticated && (
                <Button variant="outline" onClick={openModal}>
                  Login
                </Button>
              )}
            </div>

            {!loading && isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar className="w-9 h-9 cursor-pointer">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-linear-to-br from-orange-500 to-purple-600 text-white text-sm font-semibold">
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  {/* User Info */}
                  <DropdownMenuLabel className="font-normal flex items-center gap-2">
                    <Avatar className="w-9 h-9 cursor-pointer">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-linear-to-br from-orange-500 to-purple-600 text-white text-sm font-semibold">
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Menu Links */}
                  {links.dropMenu.map((l) => (
                    <DropdownMenuItem asChild key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer font-medium text-muted-foreground",
                          isActive(l.href) && "bg-accent",
                        )}
                      >
                        <l.icon className={cn("h-4 w-4", l.color)} />
                        {l.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  >
                    {isPending ? (
                      <>
                        <Loader className="animate-spin w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                      </>
                    )}
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {open && (
          <nav ref={menuRef} className="md:hidden border-t p-3 space-y-1.5 animate-in slide-in-from-top-3 shadow-md rounded-lg absolute w-[95%] left-1/2 -translate-x-1/2 border border-slate-300 dark:border-slate-600 bg-background transition-all duration-300">
            {links.navMain.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-2 text-sm font-medium transition-all duration-500",

                  isActive(i.href)
                    ? "bg-blue-10 dark:bg-blue-20 text-white"
                    : "hover:bg-accent",
                )}
              >
                {i.title}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
