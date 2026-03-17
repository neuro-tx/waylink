import { AuthProvider } from "@/components/providers/AuthProvider";
import UserLayout from "./_components/MainLayout";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { ThemedToaster } from "@/components/themed-toaster";
import { AuthGuard } from "@/components/Authguard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "User managment account",
  description:
    "Manage your actions (bookings ,vafourites ,notifications) and custome your controlle",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <AuthProvider>
            <AuthGuard>
              <UserLayout>{children}</UserLayout>
            </AuthGuard>
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
