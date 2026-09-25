"use client";

import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import "./public-site.css";

export function PublicLogo() {
  return (
    <Link className="public-logo" href="/" aria-label="Officia MENA - الرئيسية">
      <span className="public-logo-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>Officia <b>MENA</b></span>
    </Link>
  );
}

export function PublicSiteShell({ children, eyebrow, title }: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="public-site" dir="rtl" lang="ar">
      <header className="public-header">
        <PublicLogo />
        <button className="public-menu" type="button" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav id="public-navigation" className={`public-nav${open ? " is-open" : ""}`} aria-label="التنقل الرئيسي">
          <Link href="/about" onClick={() => setOpen(false)}>عن المنصة</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>تواصل معنا</Link>
          <Link href="/privacy" onClick={() => setOpen(false)}>الخصوصية</Link>
          <Link href="/terms" onClick={() => setOpen(false)}>الشروط</Link>
          <Link href="/login" onClick={() => setOpen(false)}>تسجيل الدخول</Link>
          <Link className="public-mobile-cta" href="/dashboard" onClick={() => setOpen(false)}>ابدأ الآن <ArrowLeft size={15} /></Link>
        </nav>
        <div className="public-header-actions">
          <Link className="public-login-link" href="/login">تسجيل الدخول</Link>
          <Link className="public-button public-button-small" href="/dashboard">ابدأ الآن <ArrowLeft size={15} /></Link>
        </div>
      </header>
      <main className="public-main">
        {eyebrow && <p className="public-eyebrow"><span />{eyebrow}</p>}
        {title && <h1 className="public-title">{title}</h1>}
        {children}
      </main>
      <footer className="public-footer">
        <PublicLogo />
        <p>تشغيل أوضح للأعمال التي تبني الخليج.</p>
        <div className="public-footer-links">
          <Link href="/about">عن المنصة</Link><Link href="/contact">تواصل معنا</Link>
          <Link href="/privacy">الخصوصية</Link><Link href="/terms">الشروط</Link><Link href="/login">تسجيل الدخول</Link>
        </div>
        <small>© 2026 Officia MENA · جميع الحقوق محفوظة</small>
      </footer>
    </div>
  );
}