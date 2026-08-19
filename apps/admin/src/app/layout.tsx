import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AdminSidebar } from "@/components/admin-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luxe All Fashion | Admin",
  description: "Order fulfillment, catalog, and customer management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-full bg-stone-50 text-black">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto px-10 py-10">{children}</main>
      </body>
    </html>
  );
}
