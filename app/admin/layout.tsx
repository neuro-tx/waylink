import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/AdminSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AdminHeader from "./_components/AdminHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WayLink platform controller",
  description: "Manage and controll the platform with some actions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider
              style={
                {
                  "--sidebar-width": "calc(var(--spacing) * 72)",
                  "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
              }
            >
              <AdminSidebar variant="sidebar" />
              <main className="overflow-x-hidden w-full">
                <SidebarInset>
                  <AdminHeader />
                  <div className="flex flex-1 flex-col  ">
                    <div className="w-full relative">
                      <div className="px-4 md:px-6 py-8">{children}</div>
                    </div>
                  </div>
                </SidebarInset>
                <ThemedToaster />
              </main>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
