import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Officia MENA | Enterprise Accounting",
  description: "Next Generation Accounting & ERP for the MENA Region",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
      </body>
    </html>
  );
}
