"use client";

import React, { createContext, useContext, useState } from "react";
import { Car, Compass, Route, Ticket, LucideIcon } from "lucide-react";

export type ProviderType = "transport" | "experience";

export interface ProviderConfig {
  themeColor: string;
  twTextColor: string;
  twBgColor: string;
  twLightBg: string;
  title: string;
  subtitle: string;
  primaryMetricLabel: string;
  secondaryMetricLabel: string;
  primaryIcon: LucideIcon;
  secondaryIcon: LucideIcon;
  chartGradientId: string;
  sidebarServiceLabel: string;
}

export const PROVIDER_CONFIG: Record<ProviderType, ProviderConfig> = {
  transport: {
    themeColor: "#3b82f6",
    twTextColor: "text-blue-500",
    twBgColor: "bg-blue-500",
    twLightBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Transport Fleet Overview",
    subtitle: "Manage your vehicles, drivers, and upcoming rides.",
    primaryMetricLabel: "Active Vehicles",
    secondaryMetricLabel: "Total Rides",
    primaryIcon: Car,
    secondaryIcon: Route,
    chartGradientId: "colorTransport",
    sidebarServiceLabel: "Mobility",
  },
  experience: {
    themeColor: "#f97316",
    twTextColor: "text-orange-500",
    twBgColor: "bg-orange-500",
    twLightBg: "bg-orange-100 dark:bg-orange-900/30",
    title: "Experience Catalog Overview",
    subtitle: "Manage your tours, events, and guest bookings.",
    primaryMetricLabel: "Active Tours",
    secondaryMetricLabel: "Total Guests",
    primaryIcon: Compass,
    secondaryIcon: Ticket,
    chartGradientId: "colorExperience",
    sidebarServiceLabel: "Experience Hub",
  },
};

interface ProviderContextType {
  type: ProviderType;
  setType: (type: ProviderType) => void;
  config: ProviderConfig;
}

const ProviderContext = createContext<ProviderContextType | undefined>(
  undefined,
);

export function ProviderTypeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [type, setType] = useState<ProviderType>("experience");

  return (
    <ProviderContext.Provider
      value={{ type, setType, config: PROVIDER_CONFIG[type] }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviderContext() {
  const context = useContext(ProviderContext);
  if (!context)
    throw new Error(
      "useProviderContext must be used within a ProviderTypeProvider",
    );
  return context;
}
