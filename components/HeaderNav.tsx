"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

import {
  Menu,
  X,
  UserPlus,
  Loader,
  LogOut,
  User,
  Bell,
  BookMarked,
  Heart,
} from "lucide-react";
import { useAuth } from "./providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { useClickOutside } from "@/hooks/useClickOut";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useActive } from "@/hooks/useActive";

const navLinks = [
  { title: "Explore", href: "/", exact: true },
  { title: "Transports", href: "/transport" },
  { title: "Trips", href: "/trips" },
  { title: "Most Rating", href: "/most-rating" },
];

const dropMenu = [
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
];

export default function HeaderNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout, loading, openModal } = useAuth();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const isActive = useActive();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useClickOutside(menuRef, () => setMenuOpen(false), [toggleRef]);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  // Motion variants
  const menuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <header>
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
      <nav data-state={menuOpen && "active"} className="fixed z-20 w-full px-2">
        <div
          className={cn(
            "mx-auto mt-2 container px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-6xl rounded-2xl border backdrop-blur-md lg:px-5",
          )}
        >
          <div className="relative flex items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <Link href="/" className="flex items-center space-x-2 z-50">
              <Image
                src="/icons/logo.svg"
                alt="waylink"
                width={180}
                height={70}
                priority
              />
            </Link>

            <motion.ul
              className="hidden md:flex gap-2.5 text-sm font-medium items-center"
              initial="hidden"
              animate="visible"
              variants={menuVariants}
            >
              {navLinks.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                      "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      isActive(link.href, link.exact) &&
                        "text-primary bg-accent/80 hover:bg-accent",
                    )}
                  >
                    {link.title}
                    {isActive(link.href) && (
                      <span className="absolute left-1/2 -bottom-0.5 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex items-center gap-3 z-50">
              <ThemeToggle />

              {!loading && !isAuthenticated && (
                <Button variant="outline" size="sm" onClick={openModal}>
                  <UserPlus className="h-4 w-4" />
                  Sign In
                </Button>
              )}

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
                    {dropMenu.map((l) => (
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

              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                ref={toggleRef}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>

            {/* Mobile Nav */}
            {menuOpen && (
              <motion.div
                ref={menuRef}
                className="md:hidden top-full border-t p-3 space-y-1.5 shadow-md rounded-lg absolute w-full left-1/2 -translate-x-1/2 border border-muted bg-background"
                initial="hidden"
                animate="visible"
                variants={menuVariants}
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={itemVariants}
                    className="mb-2 last:mb-0"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-2 text-sm font-medium transition-all duration-500",
                        isActive(link.href, link.exact)
                          ? "bg-blue-10 dark:bg-blue-20 text-white"
                          : "hover:bg-accent",
                      )}
                    >
                      {link.title}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
