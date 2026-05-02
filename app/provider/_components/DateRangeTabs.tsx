"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "@/lib/panel-types";

export function DateRangeTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentRange = (searchParams.get("range") as DateRange) || "30d";

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentRange} onValueChange={handleRangeChange}>
      <TabsList className="grid w-full grid-cols-4 md:w-auto bg-muted/50">
        <TabsTrigger value="7d">7 Days</TabsTrigger>
        <TabsTrigger value="30d">30 Days</TabsTrigger>
        <TabsTrigger value="90d">90 Days</TabsTrigger>
        <TabsTrigger value="1y">1 Year</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
