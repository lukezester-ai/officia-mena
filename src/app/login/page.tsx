import { signIn } from "@/auth";
import { LogIn, ArrowRight, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { tenants } from "@/lib/db/schema/tenants";

async function ensureDemoUser() {
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
      tenantId
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
          
          <form
            action={async (formData) => {
              "use server"
              await signIn("credentials", formData)
            }}
            className="space-y-4"
          >
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
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm">أو للنسخة التجريبية</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form
            action={async () => {
              "use server"
              await signIn("credentials", { email: "demo@officia.mena", isDemo: "true", redirectTo: "/dashboard" })
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

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google الدخول باستخدام
            </button>
          </form>

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
