import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub Admin — Dashboard",
  description:
    "FoodHub Admin Panel — a modern SaaS dashboard to manage restaurants, orders, dishes, deliveries and reports.",
  keywords: [
    "FoodHub",
    "Admin",
    "Dashboard",
    "Restaurants",
    "Orders",
    "Next.js",
    "shadcn/ui",
  ],
  authors: [{ name: "FoodHub Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "FoodHub Admin",
    description: "Modern SaaS food delivery admin dashboard",
    siteName: "FoodHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodHub Admin",
    description: "Modern SaaS food delivery admin dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
