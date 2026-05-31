"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing } from "@/types";

const METRICS = [
  { icon: "solar_power", label: "Solar Output", value: "3.2", unit: "kWh", pct: 85 },
  { icon: "bolt", label: "Energy Usage", value: "2.1", unit: "kWh", pct: 62 },
  { icon: "water_drop", label: "Water Usage", value: "142", unit: "gal", pct: 45 },
  { icon: "air", label: "Air Quality", value: "AQI 32", unit: "good", pct: 92 },
  { icon: "thermostat", label: "Indoor Temp", value: "72", unit: "°F", pct: 90 },
  { icon: "co2", label: "Carbon Footprint", value: "4.2", unit: "t CO₂e", pct: 58 },
];

const INSIGHTS = [
  { icon: "trending_up", label: "Solar efficiency", detail: "Up 12% this week", color: "text-secondary" },
  { icon: "check_circle", label: "Air quality", detail: "Optimal range", color: "text-secondary" },
  { icon: "trending_down", label: "Water usage", detail: "Reduced 8% vs last month", color: "text-secondary" },
];

export default function EnvironmentPage() {
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
      <main className="pt-28 pb-20 px-margin-desktop min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">energy_savings_leaf</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Environment</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Home energy and environmental metrics
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Environmental Score</h2>
              <span className="font-display-sm text-display-sm text-secondary">76%</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700" style={{ width: "76%" }} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5">
              {INSIGHTS.map((insight) => (
                <div key={insight.label} className="text-center">
                  <span className={`material-symbols-outlined ${insight.color} text-2xl`}>{insight.icon}</span>
                  <p className="font-label-sm text-label-sm text-primary mt-1">{insight.label}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{insight.detail}</p>
                </div>
              ))}
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

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Connected Sources</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "Nest Thermostat", icon: "thermostat", connected: false },
                { name: "Solar Inverter", icon: "solar_power", connected: false },
                { name: "Smart Meter", icon: "bolt", connected: false },
                { name: "Air Quality Sensor", icon: "air", connected: false },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                  <span className="font-label-sm text-label-sm">{s.name}</span>
                  <span className="text-[10px] font-bold uppercase ml-1 text-on-surface-variant/50">Add</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}