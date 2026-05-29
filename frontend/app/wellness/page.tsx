"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing } from "@/types";

const METRICS = [
  { icon: "self_improvement", label: "Mindfulness", value: "12", unit: "min", pct: 60 },
  { icon: "bedtime", label: "Sleep Quality", value: "82", unit: "%", pct: 82 },
  { icon: "monitor_heart", label: "HR Variability", value: "48", unit: "ms", pct: 72 },
  { icon: "ecg_heart", label: "Readiness", value: "94", unit: "%", pct: 94 },
  { icon: "sentiment_calm", label: "Stress Level", value: "28", unit: "low", pct: 72 },
  { icon: "exercise", label: "Recovery", value: "87", unit: "%", pct: 87 },
];

const ACTIVITIES = [
  { icon: "meditation", title: "Morning Meditation", time: "7:00 AM", done: true },
  { icon: "exercise", title: "Stretching Routine", time: "7:15 AM", done: true },
  { icon: "self_improvement", title: "Journaling", time: "8:00 AM", done: false },
  { icon: "bedtime", title: "Wind Down", time: "10:00 PM", done: false },
];

export default function WellnessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AmbientOrbs />
      <Header />
      <Sidebar />
      <main className="pt-28 pb-20 pl-32 pr-margin-desktop min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">self_improvement</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Wellness</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Mindfulness, recovery, and daily balance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
            <div className="glass-card p-6 rounded-xl col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Daily Balance</h2>
                <span className="font-display-sm text-display-sm text-secondary">81%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700" style={{ width: "81%" }} />
              </div>
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">ecg_heart</span>
                  <p className="font-headline-lg text-headline-lg text-primary">94%</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Readiness</p>
                </div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">sentiment_calm</span>
                  <p className="font-headline-lg text-headline-lg text-primary">28</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Stress</p>
                </div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">exercise</span>
                  <p className="font-headline-lg text-headline-lg text-primary">87%</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Recovery</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Today&apos;s Routine</h2>
              <div className="space-y-3">
                {ACTIVITIES.map((a) => (
                  <div key={a.title} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${a.done ? "text-secondary" : "text-on-surface-variant/50"}`}>
                      {a.done ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body-md text-body-md ${a.done ? "text-primary" : "text-on-surface-variant/50"}`}>{a.title}</p>
                      <p className="text-[11px] text-on-surface-variant">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter mb-8">
            {METRICS.map((m) => (
              <div key={m.label} className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-secondary-container text-secondary">
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-headline-lg text-headline-lg text-primary">{m.value}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{m.unit}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      m.pct >= 80 ? "bg-secondary" : m.pct >= 50 ? "bg-secondary/60" : "bg-error/60"
                    }`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}