import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionHandler from "@/components/SessionHandler";
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ClientProvider from "@/components/auth/client-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Auth Template",
  description: "Authentication template with Next.js and NextAuth.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
            <SessionHandler>
              <ClientProvider>{children}</ClientProvider>
            </SessionHandler>
          <Footer />
        </div>
      </body>
    </html>
  );
}