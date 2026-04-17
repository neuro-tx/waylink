import type { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import "../globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { ProviderTypeProvider } from "../../components/providers/ProviderContext";
import { ProviderSidebar } from "./_components/Sidebar";
import { ProviderHeader } from "./_components/Sidebar";
import { getCurrentProvider } from "@/lib/provider-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Provider Dashboard | Waylink Travel & Experiences",
  description:
    "Manage your transport services and travel experiences on Waylink. Handle bookings, customers, schedules, and performance from one dashboard.",
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, provider, role, user } = await getCurrentProvider();

  if (status === "unauthorized") {
    redirect("/");
  }

  if (status === "no-provider") {
    redirect("/onboarding");
  }

  if (status === "banned") {
    redirect("/banned");
  }

  if (status !== "ok" || !provider || !user) {
    redirect("/");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProviderTypeProvider
            initialType={provider?.serviceType}
            provider={provider}
            user={user}
            role={role}
          >
            <SidebarProvider
              style={
                {
                  "--sidebar-width": "calc(var(--spacing) * 72)",
                  "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
              }
            >
              <div className="flex min-h-screen w-full bg-background">
                <ProviderSidebar />
                <SidebarInset className="flex flex-col min-w-0 flex-1">
                  <ProviderHeader />
                  <main className="flex-1 overflow-x-hidden w-full relative">
                    {children}
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </ProviderTypeProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
