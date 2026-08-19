import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NewsletterSection } from "@/components/newsletter-section";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
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
  title: "Luxe Fashion | OG Luxemen | Chicstyle | Kiddies Space GH",
  description:
    "Premium, verified UK/US fashion: menswear, womenswear, and kidswear, delivered nationwide across Ghana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <CartProvider>
          <main className="flex-1">{children}</main>
          <Reveal>
            <NewsletterSection />
          </Reveal>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
