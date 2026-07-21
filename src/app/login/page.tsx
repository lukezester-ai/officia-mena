'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { Loader2, User, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const action = isLogin ? login : signup;
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--color-desert-400)]/20 blur-[150px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="mb-8 relative z-10 flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center font-bold text-background text-xl shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          O
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">
          Officia <span className="text-[var(--color-gold)]">MENA</span>
        </span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-3 text-lg font-bold border-b-2 transition-colors ${isLogin ? 'border-[var(--color-gold)] text-white' : 'border-transparent text-muted-foreground hover:text-white/80'}`}
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-3 text-lg font-bold border-b-2 transition-colors ${!isLogin ? 'border-[var(--color-gold)] text-white' : 'border-transparent text-muted-foreground hover:text-white/80'}`}
          >
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
            <div className="shrink-0 mt-0.5">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80" htmlFor="email">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail size={20} />
              </div>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                placeholder="name@company.com"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80" htmlFor="password">كلمة المرور</label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={20} />
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-[var(--color-gold)]/50 focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 gold-gradient text-background font-bold text-lg py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(212,175,55,0.2)]"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {isLogin ? 'دخول للمنصة' : 'إنشاء حساب'}
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </button>
          
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-muted-foreground">
            هذه بيئة تجريبية آمنة. بياناتك مشفرة ولا تتم مشاركتها.
          </p>
        </div>

      </div>
    </div>
  );
}
