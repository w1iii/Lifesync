"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { savePreferences, getPreferences, connectService } from "@/lib/api";
import type { Preferences } from "@/types";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "gmail", name: "Gmail", icon: "mail", description: "Email categorization, draft replies, and priority detection", connected: false },
  { id: "calendar", name: "Google Calendar", icon: "calendar_month", description: "Meeting sync, conflict detection, and schedule analysis", connected: false },
  { id: "fivetran", name: "Fivetran", icon: "sync_alt", description: "Financial data pipeline for transaction monitoring and budget tracking", connected: false },
  { id: "elastic", name: "RSS Feeds", icon: "rss_feed", description: "Real-time news from BBC, NYT, Bloomberg, and MarketWatch", connected: true },
  { id: "apple_health", name: "Apple Health", icon: "health_and_safety", description: "Wellness metrics — steps, sleep, heart rate, and activity", connected: false },
  { id: "fitbit", name: "Fitbit", icon: "directions_run", description: "Fitness tracking and biometric data integration", connected: false },
  { id: "oura", name: "Oura Ring", icon: "night_sight_auto", description: "Sleep tracking, readiness score, and recovery insights", connected: false },
  { id: "whoop", name: "Whoop", icon: "monitor_heart", description: "Strain, recovery, and sleep performance monitoring", connected: false },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const cached = localStorage.getItem(`lifesync_preferences_${user.uid}`);
    if (cached) {
      try {
        const p = JSON.parse(cached);
        setPrefs(p);
        if (p.connectedServices) {
          setIntegrations((prev) =>
            prev.map((i) => ({ ...i, connected: p.connectedServices.includes(i.id) || i.connected }))
          );
        }
      } catch { /* ignore */ }
    }

    getPreferences(user.uid)
      .then((data) => {
        setPrefs(data);
        localStorage.setItem(`lifesync_preferences_${user.uid}`, JSON.stringify(data));
        if (data.connectedServices) {
          setIntegrations((prev) =>
            prev.map((i) => ({ ...i, connected: data.connectedServices.includes(i.id) || i.connected }))
          );
        }
      })
      .catch(() => {});
  }, [user]);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((prev) => prev ? { ...prev, ...patch } : null);
  }, []);

  const handleToggleIntegration = async (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    const updated = integrations.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i));
    setIntegrations(updated);

    if (!integration.connected && (id === "gmail" || id === "calendar")) {
      try {
        await connectService(id as "gmail" | "calendar", user!.uid);
      } catch { /* backend may be offline */ }
    }

    const connectedServices = updated.filter((i) => i.connected).map((i) => i.id);
    const key = `lifesync_preferences_${user!.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || "null");
    const newPrefs = {
      userId: user!.uid,
      briefingTime: existing?.briefingTime || { hour: 7, minute: 30, ampm: "AM" },
      briefingIntensity: existing?.briefingIntensity || 65,
      modules: existing?.modules || [],
      connectedServices,
    };
    localStorage.setItem(key, JSON.stringify(newPrefs));
    setPrefs(newPrefs);
    try { await savePreferences(newPrefs); } catch { /* backend may be offline */ }
  };

  const handleSave = async () => {
    if (!user || !prefs) return;
    const connectedServices = integrations.filter((i) => i.connected).map((i) => i.id);
    const toSave = { ...prefs, connectedServices };
    setSaving(true);
    try {
      await savePreferences(toSave);
      localStorage.setItem(`lifesync_preferences_${user.uid}`, JSON.stringify(toSave));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* backend may be offline */ }
    setSaving(false);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <>
      <AuthLayout>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary text-3xl">settings</span>
              <div>
                <h1 className="font-display-lg text-display-lg text-primary">Settings</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Manage your preferences</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !prefs}
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save"}
            </button>
          </div>

          {prefs && (
            <>
              <section className="glass-card p-6 rounded-xl mb-6">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
                  Briefing Time
                </h2>
                <div className="flex items-center gap-4">
                  <select
                    value={prefs.briefingTime.hour}
                    onChange={(e) => update({ briefingTime: { ...prefs.briefingTime, hour: Number(e.target.value) } })}
                    className="glass-card px-4 py-2 rounded-xl bg-surface-container text-primary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-on-surface-variant">:</span>
                  <select
                    value={prefs.briefingTime.minute}
                    onChange={(e) => update({ briefingTime: { ...prefs.briefingTime, minute: Number(e.target.value) } })}
                    className="glass-card px-4 py-2 rounded-xl bg-surface-container text-primary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <select
                    value={prefs.briefingTime.ampm}
                    onChange={(e) => update({ briefingTime: { ...prefs.briefingTime, ampm: e.target.value } })}
                    className="glass-card px-4 py-2 rounded-xl bg-surface-container text-primary font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </section>

              <section className="glass-card p-6 rounded-xl mb-6">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">tune</span>
                  Briefing Intensity
                </h2>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prefs.briefingIntensity}
                    onChange={(e) => update({ briefingIntensity: Number(e.target.value) })}
                    className="custom-slider flex-1"
                  />
                  <span className="font-headline-lg text-headline-lg text-secondary w-12 text-right">{prefs.briefingIntensity}%</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-sm">
                  {prefs.briefingIntensity < 30 ? "Concise — just the essentials" :
                   prefs.briefingIntensity < 70 ? "Balanced — key highlights" :
                   "Deep — full analysis with all details"}
                </p>
              </section>

              <section className="glass-card p-6 rounded-xl mb-6">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">module</span>
                  Modules
                </h2>
                <div className="space-y-3">
                  {prefs.modules.map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between py-2">
                      <p className="font-body-md text-body-md font-bold text-primary capitalize">{mod.id}</p>
                      <div className="flex items-center gap-3">
                        {mod.priority !== undefined && (
                          <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mod.priority}
                              onChange={() =>
                                update({
                                  modules: prefs.modules.map((m) =>
                                    m.id === mod.id ? { ...m, priority: !m.priority } : m
                                  ),
                                })
                              }
                              className="toggle-checkbox"
                            />
                            Priority
                          </label>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mod.enabled}
                            onChange={() =>
                              update({
                                modules: prefs.modules.map((m) =>
                                  m.id === mod.id ? { ...m, enabled: !m.enabled } : m
                                ),
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-secondary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-lg">sync_alt</span>
                    Integrations
                  </h2>
                  <span className="text-xs text-on-surface-variant">{connectedCount} of {integrations.length} connected</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-5">
                  <div className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700" style={{ width: `${(connectedCount / integrations.length) * 100}%` }} />
                </div>
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                      <div className={`p-3 rounded-full ${integration.connected ? "bg-secondary-container" : "bg-surface-container-high"} text-secondary shrink-0`}>
                        <span className="material-symbols-outlined">{integration.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-body-md text-body-md font-bold text-primary">{integration.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">{integration.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleIntegration(integration.id)}
                        className={`shrink-0 px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-wider transition-all ${
                          integration.connected
                            ? "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/70"
                            : "bg-primary text-on-primary hover:opacity-90"
                        }`}
                      >
                        {integration.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card p-6 rounded-xl">
                <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">account_circle</span>
                  Account
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">UID</span>
                    <span className="font-body-md text-body-md text-primary font-mono text-sm">{user.uid}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Email</span>
                    <span className="font-body-md text-body-md text-primary">{user.email}</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </AuthLayout>
    </>
  );
}