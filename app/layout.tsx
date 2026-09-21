import type { Metadata } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSession } from "@/lib/auth";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Digital Heroes — Play. Give. Win.",
    template: "%s · Digital Heroes",
  },
  description:
    "A monthly prize draw funded by golf scores and subscriptions, with a mandatory share for the charity you choose.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${fraunces.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader session={session} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
