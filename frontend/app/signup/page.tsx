"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LandingNav from "@/components/LandingNav";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  useEffect(() => {
    const blobs = document.querySelectorAll<HTMLElement>(".organic-blob");
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name, email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      setError("Google sign-up failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <div className="bg-animated-gradient" />
      <div className="organic-blob w-[600px] h-[600px] bg-secondary-container -top-40 -left-20" />
      <div className="organic-blob w-[400px] h-[400px] bg-tertiary-fixed -bottom-20 -right-20" style={{ animationDelay: "-5s" }} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-[480px] rounded-xl p-10 md:p-14 flex flex-col items-center relative overflow-hidden inner-glow">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-white text-[28px]">nature_people</span>
              </div>
            </div>
            <h1 className="font-display-lg text-display-lg text-primary">Create Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Begin your harmony journey</p>
          </div>

          {error && (
            <div className="w-full mb-4 px-4 py-3 bg-red-50/80 border border-red-200 rounded-full text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-4 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  person
                </span>
                <input
                  className="w-full h-14 pl-14 pr-6 bg-white/40 border border-white/20 rounded-full font-body-md text-body-md text-on-surface focus:border-secondary transition-all placeholder:text-outline-variant"
                  placeholder="Your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-4 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  mail
                </span>
                <input
                  className="w-full h-14 pl-14 pr-6 bg-white/40 border border-white/20 rounded-full font-body-md text-body-md text-on-surface focus:border-secondary transition-all placeholder:text-outline-variant"
                  placeholder="hello@lifesync.ai"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-4 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  lock
                </span>
                <input
                  className="w-full h-14 pl-14 pr-14 bg-white/40 border border-white/20 rounded-full font-body-md text-body-md text-on-surface focus:border-secondary transition-all placeholder:text-outline-variant"
                  placeholder="••••••••"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {passwordVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-4 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                  lock
                </span>
                <input
                  className="w-full h-14 pl-14 pr-14 bg-white/40 border border-white/20 rounded-full font-body-md text-body-md text-on-surface focus:border-secondary transition-all placeholder:text-outline-variant"
                  placeholder="••••••••"
                  type={confirmVisible ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                  onClick={() => setConfirmVisible(!confirmVisible)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {confirmVisible ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-primary text-white rounded-full font-body-md text-body-md font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account..." : "Create Account"}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="flex items-center w-full my-6 gap-4">
            <div className="h-px bg-white/30 flex-grow" />
            <span className="font-label-sm text-label-sm text-outline-variant uppercase">or</span>
            <div className="h-px bg-white/30 flex-grow" />
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleGoogle}
              className="w-full h-14 bg-white/40 border border-white/30 rounded-full font-body-md text-body-md text-primary flex items-center justify-center gap-3 hover:bg-white/60 transition-colors"
            >
              <Image
                alt="Google"
                className="w-6 h-6"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEPvALZhVND3kajWOUJ0OdB-N8jAu0CLZ63GYTwAzFHOkBcpBOtfaGx7S1ayvhgA2tnr80E8VXbu5sAD96w6v3imrjTEMb38Nxj5x322unuFjJICRWkyl69dhXh4xrodg1q8w-N3JHnj7gMioIlHcz8L3tlslPewMqZrrM0HJ8k8V8S6hM3bF_B0o3RZGjGMMw-NVFaD14IJ9bzneNz4G68bAns7ViI-NIpHoyvR1QX-hsWlZqMRjYsG17rmRK1_KOG23B_zSK4d4"
                width={24}
                height={24}
                unoptimized
              />
              Sign up with Google
            </button>
          </div>

          <p className="mt-6 font-body-md text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <a className="text-secondary font-bold hover:underline" href="/login">
              Sign in
            </a>
          </p>
        </div>
      </main>

      <footer className="w-full py-8 px-margin-desktop">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-label-sm text-label-sm text-outline">
            &copy; 2024 LifeSync AI. Nurturing digital harmony.
          </span>
          <div className="flex gap-8">
            <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" href="#">
              Privacy
            </a>
            <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" href="#">
              Terms
            </a>
            <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
