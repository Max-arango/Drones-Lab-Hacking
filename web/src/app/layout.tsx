import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthInit } from "@/components/auth/auth-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DroneSec Lab — Drone Cybersecurity Academy",
  description:
    "Academia interactiva de Drone Cybersecurity. Aprende desde Linux y networking hasta análisis de protocolos, Wi-Fi, APIs, firmware y seguridad de UAVs mediante laboratorios y simuladores controlados.",
  keywords: [
    "drone security",
    "UAV cybersecurity",
    "MAVLink",
    "pentesting",
    "Wireshark",
    "drone hacking lab",
  ],
  authors: [{ name: "DroneSec Lab" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthInit />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
