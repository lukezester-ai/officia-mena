import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div dir="ltr" className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-zinc-950">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Officia MENA</h1>
          <p className="text-zinc-400">تسجيل الدخول إلى حسابك</p>
        </div>
        
        <div className="shadow-2xl shadow-black/50 rounded-2xl">
          <SignIn 
            appearance={{
              elements: {
                card: "bg-zinc-900 border border-zinc-800",
                headerTitle: "text-white",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton: "border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white",
                socialButtonsBlockButtonText: "text-white",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500",
                formFieldLabel: "text-zinc-300",
                formFieldInput: "bg-zinc-950 border-zinc-800 text-white focus:border-blue-500",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-blue-400",
              },
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
