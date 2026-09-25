import { signIn } from "@/auth";
import { LogIn, ArrowRight, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { tenants } from "@/lib/db/schema/tenants";
import GoogleSignInButton from "./google-sign-in-button";

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--color-gold-500)]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block p-4 bg-zinc-900 rounded-full border border-zinc-800 mb-6 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-[var(--color-gold-500)]" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك في أوفيسيا</h1>
          <p className="text-zinc-400">النظام الشامل لإدارة الشركات في الشرق الأوسط</p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
          
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
              <label className="block text-sm font-medium text-zinc-400 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)] transition-all font-sans"
                placeholder="name@company.com"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--color-gold-500)] transition-all font-sans"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl gold-gradient text-[#1A120B] font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2"
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
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all border border-zinc-700 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              الدخول السريع (Demo Admin)
            </button>
          </form>
          </>}

          <GoogleSignInButton />

        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
          <Link href="/" className="hover:text-[var(--color-gold-500)] transition-colors flex items-center justify-center gap-2">
             العودة للصفحة الرئيسية <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}
