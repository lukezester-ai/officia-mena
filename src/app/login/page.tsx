import { signIn } from "@/auth";
import { LogIn, ArrowRight, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { tenants } from "@/lib/db/schema/tenants";
import GoogleSignInButton from "./google-sign-in-button";
import { PublicSiteShell } from "@/components/marketing/PublicSiteShell";

async function ensureDemoUser() {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN !== "true") return;
  const email = "demo@officia.mena";
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existing.length === 0) {
    let tenantId = null;
    const defaultTenantName = 'Officia MENA Corp';
    const tenantRecords = await db.select().from(tenants).where(eq(tenants.name, defaultTenantName)).limit(1);
    
    if (tenantRecords.length > 0) {
      tenantId = tenantRecords[0].id;
    } else {
      const [newTenant] = await db.insert(tenants).values({
        name: defaultTenantName,
        crn: '1010123456',
      }).returning();
      tenantId = newTenant.id;
    }

    const hash = await bcrypt.hash("demo123", 10);
    await db.insert(users).values({
      email,
      firstName: "Demo",
      lastName: "Admin",
      passwordHash: hash,
      tenantId,
      role: 'admin',
    });
  }
}

export default async function LoginPage() {
  // Ensure demo user exists in DB before rendering the page so the demo login works immediately
  await ensureDemoUser();

  return (
    <PublicSiteShell eyebrow="مساحة العمل" title="مرحباً بك في أوفيسيا">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-gold-500)]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="login-wrap">
        <div className="text-center mb-8">
          <Link href="/" className="login-mark">
            <ShieldCheck className="w-10 h-10 text-[var(--color-gold-500)]" />
          </Link>
          <p className="login-subtitle">النظام الشامل لإدارة الشركات في الشرق الأوسط</p>
        </div>

        <div className="login-card">
          
          {process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_LOGIN === "true" && <form
            action={async (formData) => {
              "use server"
              try {
                await signIn("credentials", formData)
              } catch (error) {
                const err = error as Error & { type?: string };
                if (err?.type === "CredentialsSignin") {
                  // Ignore and redirect back with error
                } else {
                  throw error; // Rethrow NEXT_REDIRECT
                }
              }
            }}
            className="space-y-4"
          >
            {/* Show error if needed */}
            <div>
              <label htmlFor="login-email">البريد الإلكتروني</label>
              <input
                type="email"
                 id="login-email" name="email"
                required
                 className="login-input"
                placeholder="name@company.com"
                dir="ltr"
              />
            </div>
            
            <div>
              <label htmlFor="login-password">كلمة المرور</label>
              <input
                type="password"
                 id="login-password" name="password"
                required
                 className="login-input"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            
            <button
              type="submit"
               className="login-submit"
            >
              تسجيل الدخول <LogIn className="w-5 h-5" />
            </button>
          </form>}

          {process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_LOGIN === "true" && <>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">أو للدخول التجريبي</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form
            action={async () => {
              "use server"
              try {
                await signIn("credentials", { email: "demo@officia.mena", isDemo: "true", redirectTo: "/dashboard" })
              } catch (error) {
                const err = error as Error & { type?: string };
                if (err?.type === "CredentialsSignin") {
                  // Error
                } else {
                  throw error; // Rethrow NEXT_REDIRECT
                }
              }
            }}
          >
            <button
              type="submit"
               className="login-demo"
            >
              <User className="w-5 h-5" />
              الدخول السريع (Demo Admin)
            </button>
          </form>
          </>}

          <GoogleSignInButton />

        </div>

        <p className="login-return">
          <Link href="/">
             العودة للصفحة الرئيسية <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </PublicSiteShell>
  );
}
