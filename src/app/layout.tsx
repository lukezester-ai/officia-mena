import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Officia MENA | Enterprise Accounting & ERP",
  description: "Next Generation AI-powered Accounting & ERP for the MENA Region. Fully compliant with ZATCA phase 2 invoicing regulations.",
  keywords: ["Accounting", "ERP", "ZATCA", "MENA", "AI", "Invoicing", "Tax"],
  authors: [{ name: "Officia MENA AI Team", url: "https://officia-mena.com" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${cairo.variable} antialiased font-cairo bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
