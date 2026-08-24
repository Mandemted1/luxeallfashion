import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NewsletterSection } from "@/components/newsletter-section";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { getHeroContent } from "@/lib/homepage-content";
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
  manifest: "/site.webmanifest",
};

// Newsletter heading and footer social links read straight from the
// database — without this, Next.js would bake them in at build/first-render
// time and admin edits wouldn't show up until the next deploy. Same
// reasoning as checkout/page.tsx's delivery-region fetch.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { newsletterHeading } = await getHeroContent();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-black">
        <CartProvider>
          <main className="flex-1">{children}</main>
          <Reveal>
            <NewsletterSection heading={newsletterHeading} />
          </Reveal>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
