"use client";

import * as React from "react";
import {
  Search,
  CalendarDays,
  Users,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative hidden md:inline-flex h-9 w-full items-center justify-start gap-2 rounded-md border border-input bg-muted/50 px-4 py-2 text-sm font-normal text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-56 lg:w-80"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">
          Search bookings, products...
        </span>
        <span className="inline-flex lg:hidden">Search...</span>

        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="md:hidden"
        variant="ghost"
      >
        <Search className="h-4 w-4 shrink-0" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search bookings or products…" />
        <CommandList className="max-h-75 overflow-y-auto">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Links">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/provider/products"))
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>My Products</span>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/provider/bookings"))
              }
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Bookings</span>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/provider/reviews"))
              }
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Reviews</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/provider/settings/profile"))
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>

            <CommandItem
              onSelect={() =>
                runCommand(() => router.push("/provider/settings/billing"))
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
