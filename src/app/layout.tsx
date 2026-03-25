import type { ReactNode } from "react";
import type { Metadata } from "next";

import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "Нөөцийн дэлгүүр",
  description: "Бүтээгдэхүүн болон агуулахын удирдлагын апп",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>
        <CartProvider>
          <div className="site-shell">
            <SiteHeader />
            <main className="page">{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
