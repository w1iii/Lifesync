"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { savePreferences, connectService } from "@/lib/api";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const userName = auth.currentUser?.displayName || "there";
  const userId = auth.currentUser?.uid || "test";

  // counting animation for step 1 orb
  useEffect(() => {
    if (step !== 1) return;
    const el = document.getElementById("orb-percentage");
    if (!el) return;
    let count = 0;
    const target = 18;
    const timer = setInterval(() => {
      if (count >= target) {
        clearInterval(timer);
      } else {
        count++;
        el.textContent = count + "%";
      }
    }, 50);
    return () => clearInterval(timer);
  }, [step]);

  const [connected, setConnected] = useState<string[]>(["fivetran"]);

  const handleConnect = async (service: string) => {
    if (connected.includes(service)) return;
    if (service === "gmail" || service === "calendar") {
      try {
        await connectService(service, userId);
      } catch {
        // backend may not be running — mark connected anyway for demo
      }
    }
    setConnected((prev) => [...prev, service]);
  };

  const finish = async () => {
    setSaving(true);
    try {
      await savePreferences({
        userId,
        briefingTime: { hour: 7, minute: 30, ampm: "AM" },
        briefingIntensity: 65,
        modules: [
          { id: "circadian", enabled: true, priority: true },
          { id: "eco", enabled: false, priority: false },
          { id: "focus", enabled: true, priority: true },
        ],
        connectedServices: connected,
      });
    } catch {
      // still navigate even if save fails
    }
    setSaving(false);
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== STEP 1: Welcome + Ecosystem Connect ===== */}
      {step === 1 && (
        <>
          <main className="relative min-h-screen flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-12 overflow-hidden">
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-fixed-dim/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-tertiary-fixed/20 rounded-full blur-[150px]" />

            <div className="relative w-full max-w-4xl flex flex-col items-center z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-outline-variant" />
                <div className="w-2 h-2 rounded-full bg-outline-variant" />
                <span className="font-label-sm text-label-sm text-outline ml-2">STEP 1 OF 3</span>
              </div>

              <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12 flex items-center justify-center">
                <div className="absolute inset-0 border border-secondary/10 rounded-full pulse-soft" />
                <div className="absolute inset-4 border border-secondary/20 rounded-full pulse-soft" style={{ animationDelay: "1s" }} />
                <div className="animated-orb orb-gradient w-48 h-48 md:w-60 md:h-60 rounded-full flex flex-col items-center justify-center text-center relative z-10 overflow-hidden">
                  <span className="material-symbols-outlined text-secondary opacity-40 text-4xl mb-2">
                    temp_preferences_custom
                  </span>
                  <span id="orb-percentage" className="font-display-lg text-display-lg text-primary">0%</span>
                  <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant tracking-widest mt-1">
                    INITIALIZING
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/10 backdrop-blur-sm pointer-events-none" />
                </div>
                <div className="absolute -top-4 -left-4 w-12 h-12 glass-card rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-xl">eco</span>
                </div>
                <div className="absolute bottom-4 -right-2 w-16 h-16 glass-card rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">psychology</span>
                </div>
              </div>

              <div className="text-center mb-12">
                <h1 className="font-display-lg text-display-lg md:text-[64px] text-primary mb-4">
                  Welcome, {userName}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
                  Let&apos;s begin your journey toward digital harmony. First, let&apos;s weave your most
                  important tools into your new ecosystem.
                </p>
              </div>

              <div className="w-full max-w-2xl">
                <p className="font-label-sm text-label-sm text-outline text-center mb-6 uppercase tracking-widest">
                  Connect your ecosystem
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  {[
                    { icon: "mail", name: "Gmail", service: "gmail" },
                    { icon: "sync_alt", name: "Fivetran", service: "fivetran" },
                    { icon: "calendar_month", name: "Calendar", service: "calendar" },
                  ].map((mod) => {
                    const linked = connected.includes(mod.service);
                    return (
                      <div
                        key={mod.name}
                        className="integration-item group cursor-pointer"
                        onClick={() => handleConnect(mod.service)}
                      >
                        <div className="icon-box glass-card p-8 rounded-xl flex flex-col items-center transition-all duration-300">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${linked ? "bg-secondary-container" : "bg-surface-container"}`}>
                            <span className="material-symbols-outlined text-secondary text-3xl">{mod.icon}</span>
                          </div>
                          <span className="font-label-sm text-label-sm text-primary">{mod.name}</span>
                          <div className={`mt-4 ${linked ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${linked ? "bg-surface-container-high text-on-secondary-fixed-variant" : "bg-secondary-container text-secondary"}`}>
                              {linked ? "LINKED" : "CONNECT"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-16 flex flex-col items-center">
                <button
                  onClick={() => setStep(2)}
                  className="bg-primary text-on-primary px-12 py-4 rounded-full font-headline-lg text-headline-lg scale-95 active:scale-90 transition-all hover:shadow-xl hover:shadow-primary/20 group"
                >
                  Continue
                  <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <button onClick={finish} className="mt-6 font-label-sm text-label-sm text-outline hover:text-primary transition-colors">
                  I&apos;ll do this later
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {/* ===== STEP 2: Tailor Your Rituals ===== */}
      {step === 2 && (
        <>
          <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12 flex-1 min-h-screen">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Tailor Your Rituals</h2>
              <p className="text-on-surface-variant">
                Define how LifeSync integrates with your natural rhythm. Choose your focus modules and
                daily briefing moments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 lg:col-span-4 glass-card rounded-xl p-container-padding flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[500px]">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-secondary-container/20 organic-shape blur-3xl" />
                <div className="relative z-10 text-center w-full">
                  <span className="material-symbols-outlined text-secondary text-5xl mb-6 inline-block">
                    schedule
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Briefing Time</h3>
                  <p className="text-on-surface-variant font-label-sm text-label-sm mb-12">
                    When should we sync your goals?
                  </p>

                  <div className="flex items-center justify-center gap-4 py-8 relative">
                    <div className="flex flex-col items-center">
                      <div className="text-outline opacity-30 text-4xl font-light">06</div>
                      <div className="text-primary text-6xl font-light py-2">07</div>
                      <div className="text-outline opacity-30 text-4xl font-light">08</div>
                    </div>
                    <div className="text-primary text-4xl font-light mb-1">:</div>
                    <div className="flex flex-col items-center">
                      <div className="text-outline opacity-30 text-4xl font-light">15</div>
                      <div className="text-primary text-6xl font-light py-2">30</div>
                      <div className="text-outline opacity-30 text-4xl font-light">45</div>
                    </div>
                    <div className="flex flex-col items-center ml-2">
                      <div className="text-outline opacity-30 text-xl font-bold">AM</div>
                      <div className="text-secondary text-2xl font-bold py-2">AM</div>
                      <div className="text-outline opacity-30 text-xl font-bold">PM</div>
                    </div>
                    <div className="absolute inset-x-0 h-20 border-y border-secondary/20 pointer-events-none" />
                  </div>

                  <div className="mt-12 w-full px-4">
                    <label className="block text-left font-label-sm text-label-sm text-on-surface-variant mb-4">
                      Briefing Intensity
                    </label>
                    <input
                      className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer custom-slider"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="65"
                    />
                    <div className="flex justify-between mt-2 font-label-sm text-[10px] text-outline uppercase tracking-widest">
                      <span>Gentle</span>
                      <span>Deep Dive</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: "wb_sunny", title: "Circadian Rhythm", desc: "Sync your lighting and activities with your natural biological clock for better sleep.", priority: true, enabled: true },
                  { icon: "eco", title: "Eco-Harmony", desc: "Track your digital carbon footprint and receive daily tips for sustainable living.", priority: false, enabled: false },
                  { icon: "psychology", title: "Deep Focus", desc: "Intelligent notification filtering based on your neural focus cycles and tasks.", priority: true, enabled: true },
                ].map((mod) => (
                  <div
                    key={mod.title}
                    className={`glass-card rounded-xl p-8 group hover:bg-white/60 transition-all duration-500 cursor-pointer ${mod.enabled ? "" : "opacity-60"}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${mod.enabled ? "bg-secondary-container text-secondary" : "bg-surface-container text-outline"}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: mod.enabled ? "'FILL' 1" : "'FILL' 0" }}>
                          {mod.icon}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          defaultChecked={mod.enabled}
                          className="sr-only toggle-checkbox"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest rounded-full transition-colors toggle-label">
                          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform toggle-dot" />
                        </div>
                      </label>
                    </div>
                    <h4 className="font-headline-lg text-2xl text-primary mb-2">{mod.title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{mod.desc}</p>
                    {mod.priority && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">
                          Priority
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="rounded-xl overflow-hidden relative min-h-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/30 to-tertiary-fixed/30 flex items-end p-6">
                    <p className="text-on-surface font-label-sm text-xs italic opacity-70">
                      &ldquo;Nature does not hurry, yet everything is accomplished.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto border-t border-surface-container-highest pt-12">
              <button
                onClick={() => setStep(1)}
                className="px-10 py-4 rounded-full border border-outline/20 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container transition-all flex items-center gap-2 group"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Previous Step
              </button>
              <div className="flex items-center gap-8">
                <button onClick={finish} className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors">
                  Skip for now
                </button>
                <button
                  onClick={finish}
                  className="px-12 py-4 rounded-full bg-primary text-white font-label-sm text-label-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  Next: Connectivity
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </main>
        </>
      )}

    </div>
  );
}
