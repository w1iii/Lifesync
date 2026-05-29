"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing } from "@/types";

const METRICS = [
  { icon: "directions_walk", label: "Steps", value: "7,842", target: "10,000", unit: "steps", pct: 78 },
  { icon: "bedtime", label: "Sleep", value: "6.5", target: "8", unit: "hours", pct: 81 },
  { icon: "monitor_heart", label: "Heart Rate", value: "62", target: "60–100", unit: "bpm", pct: 100 },
  { icon: "self_improvement", label: "Mindfulness", value: "12", target: "20", unit: "min", pct: 60 },
  { icon: "local_fire_department", label: "Active Calories", value: "418", target: "600", unit: "cal", pct: 70 },
  { icon: "water_drop", label: "Hydration", value: "4", target: "8", unit: "glasses", pct: 50 },
];

const INSIGHTS = [
  { icon: "trending_up", label: "Sleep trend", detail: "Improving — up 24min vs last week", color: "text-secondary" },
  { icon: "trending_down", label: "Step count", detail: "Down 12% this week", color: "text-error" },
  { icon: "check_circle", label: "Resting HR", detail: "Stable at 62 bpm", color: "text-secondary" },
];

export default function HealthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`lifesync_briefing_${user.uid}`);
    if (cached) {
      try {
        setBriefing(JSON.parse(cached));
      } catch { /* ignore */ }
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const anomalyCount = briefing?.modules?.anomaly?.totalAnomalies ?? 0;

  return (
    <>
      <AuthLayout>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">favorite</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Health</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Daily wellness summary &mdash; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
            <div className="glass-card p-6 rounded-xl col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Wellness Score</h2>
                <span className="font-display-sm text-display-sm text-secondary">78%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700" style={{ width: "78%" }} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {INSIGHTS.map((insight) => (
                  <div key={insight.label} className="text-center">
                    <span className={`material-symbols-outlined ${insight.color} text-2xl`}>{insight.icon}</span>
                    <p className="font-label-sm text-label-sm text-primary mt-1">{insight.label}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{insight.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary text-4xl mb-3">ecg_heart</span>
              <span className="font-display-sm text-display-sm text-primary">94%</span>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">Readiness</p>
              {anomalyCount > 0 && (
                <p className="text-[11px] text-error mt-2">{anomalyCount} anomaly{anomalyCount > 1 ? "ies" : "y"} flagged</p>
              )}
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant">/ {m.target} {m.unit}</span>
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

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Connected Sources</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Apple Health", icon: "health_and_safety", connected: false },
                { name: "Fitbit", icon: "directions_run", connected: false },
                { name: "Oura Ring", icon: "night_sight_auto", connected: false },
                { name: "Whoop", icon: "monitor_heart", connected: false },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  <span className="font-label-sm text-label-sm">{s.name}</span>
                  <span className={`text-[10px] font-bold uppercase ml-1 ${s.connected ? "text-secondary" : "text-on-surface-variant/50"}`}>
                    {s.connected ? "Connected" : "Add"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}