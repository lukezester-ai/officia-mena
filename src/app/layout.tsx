import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://officia-mena.com";

export const metadata: Metadata = {
  title: {
    default: "Officia MENA | منصة محاسبية ذكية للشركات في الشرق الأوسط",
    template: "%s | Officia MENA",
  },
  description: "منصة محاسبية متكاملة مدعومة بالذكاء الاصطناعي للشركات في منطقة الشرق الأوسط. متوافقة مع ZATCA، إدارة الفواتير، المصروفات، المخزون، والرواتب.",
  keywords: ["محاسبة", "ERP", "ZATCA", "الشرق الأوسط", "ذكاء اصطناعي", "فوترة إلكترونية", "إدارة مالية", "السعودية", "برنامج محاسبة"],
  authors: [{ name: "Agri Nexus Ltd", url: "https://agrinexus.eu" }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Officia MENA | منصة محاسبية ذكية للشركات في الشرق الأوسط",
    description: "منصة محاسبية متكاملة مدعومة بالذكاء الاصطناعي. متوافقة مع ZATCA.",
    url: siteUrl,
    siteName: "Officia MENA",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Officia MENA | منصة محاسبية ذكية",
    description: "منصة محاسبية متكاملة مدعومة بالذكاء الاصطناعي. متوافقة مع ZATCA.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
