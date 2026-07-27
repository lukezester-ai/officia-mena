import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div dir="ltr" className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-zinc-950">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Officia MENA</h1>
          <p className="text-zinc-400">إنشاء حساب جديد</p>
        </div>
        
        <div className="shadow-2xl shadow-black/50 rounded-2xl">
          <SignUp 
            routing="path"
            path="/signup"
            signInUrl="/login"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
