import type { Metadata } from "next";
import { Jost, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import CartModal from "@/components/cart-modal";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stylo Nails - Esmalteria Premium",
  description: "Esmalteria premium com serviços de unhas e produtos exclusivos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${jost.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#1A1612] text-[#F8F1E9] font-sans">
        <CartProvider>
          {children}
          <CartModal />
        </CartProvider>
      </body>
    </html>
  );
}
