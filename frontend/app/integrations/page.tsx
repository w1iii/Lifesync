"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { connectService, savePreferences, getPreferences } from "@/lib/api";
import type { Preferences } from "@/types";

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  color: string;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "gmail", name: "Gmail", icon: "mail", description: "Email categorization, draft replies, and priority detection", connected: false, color: "bg-surface-container" },
    { id: "calendar", name: "Google Calendar", icon: "calendar_month", description: "Meeting sync, conflict detection, and schedule analysis", connected: false, color: "bg-surface-container" },
    { id: "fivetran", name: "Fivetran", icon: "sync_alt", description: "Financial data pipeline for transaction monitoring and budget tracking", connected: false, color: "bg-surface-container" },
    { id: "elastic", name: "RSS Feeds", icon: "rss_feed", description: "Real-time news from BBC, NYT, Bloomberg, and MarketWatch", connected: true, color: "bg-secondary-container" },
    { id: "apple_health", name: "Apple Health", icon: "health_and_safety", description: "Wellness metrics — steps, sleep, heart rate, and activity", connected: false, color: "bg-surface-container" },
    { id: "fitbit", name: "Fitbit", icon: "directions_run", description: "Fitness tracking and biometric data integration", connected: false, color: "bg-surface-container" },
    { id: "oura", name: "Oura Ring", icon: "night_sight_auto", description: "Sleep tracking, readiness score, and recovery insights", connected: false, color: "bg-surface-container" },
    { id: "whoop", name: "Whoop", icon: "monitor_heart", description: "Strain, recovery, and sleep performance monitoring", connected: false, color: "bg-surface-container" },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    // Check URL param from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const connectedParam = params.get("connected");
    if (connectedParam) {
      window.history.replaceState({}, "", "/integrations");
    }

    getPreferences(user.uid)
      .then((prefs: Preferences) => {
        if (prefs?.connectedServices) {
          const merged = prefs.connectedServices;
          if (connectedParam && !merged.includes(connectedParam)) {
            merged.push(connectedParam);
          }
          setIntegrations((prev) =>
            prev.map((i) => ({
              ...i,
              connected: merged.includes(i.id) || i.connected,
            }))
          );
        }
        // Only write backend prefs to localStorage if nothing cached locally
        const key = `lifesync_preferences_${user.uid}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(prefs));
        } else if (connectedParam) {
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          const mergedServices = [...new Set([...(existing.connectedServices || []), connectedParam])];
          const updated = { ...existing, connectedServices: mergedServices };
          localStorage.setItem(key, JSON.stringify(updated));
          // Persist to backend
          savePreferences({
            userId: user.uid,
            briefingTime: updated.briefingTime || { hour: 7, minute: 30, ampm: "AM" },
            briefingIntensity: updated.briefingIntensity || 65,
            modules: updated.modules || [],
            connectedServices: mergedServices,
          }).catch(() => {});
        }
      })
      .catch(() => {
        const cached = localStorage.getItem(`lifesync_preferences_${user.uid}`);
        if (cached) {
          try {
            const prefs = JSON.parse(cached);
            if (prefs?.connectedServices) {
              setIntegrations((prev) =>
                prev.map((i) => ({
                  ...i,
                  connected: prefs.connectedServices.includes(i.id) || i.connected,
                }))
              );
            }
          } catch { /* ignore */ }
        }
      });
  }, [user]);

  const handleToggle = async (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    const updated = integrations.map((i) => i.id === id ? { ...i, connected: !i.connected } : i);
    setIntegrations(updated);

    if (!integration.connected) {
      if (id === "gmail" || id === "calendar") {
        try {
          await connectService(id as "gmail" | "calendar", user!.uid);
        } catch { /* backend may be offline */ }
      }
    }

    const connectedServices = updated.filter((i) => i.connected).map((i) => i.id);
    const key = `lifesync_preferences_${user!.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || "null");
    const prefs = {
      userId: user!.uid,
      briefingTime: existing?.briefingTime || { hour: 7, minute: 30, ampm: "AM" },
      briefingIntensity: existing?.briefingIntensity || 65,
      modules: existing?.modules || [],
      connectedServices,
    };
    localStorage.setItem(key, JSON.stringify(prefs));

    try {
      await savePreferences(prefs);
    } catch { /* backend may be offline */ }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const connected = integrations.filter((i) => i.connected).length;
  const total = integrations.length;

  return (
    <>
      <AmbientOrbs />
      <Header />
      <Sidebar />
      <main className="pt-28 pb-20 pl-32 pr-margin-desktop min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">sync_alt</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Integrations</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {connected} of {total} services connected
              </p>
            </div>
          </div>

          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700"
              style={{ width: `${(connected / total) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="glass-card p-5 rounded-xl flex items-center gap-4 hover:bg-secondary/5 transition-all">
                <div className={`p-3 rounded-full ${integration.color} text-secondary shrink-0`}>
                  <span className="material-symbols-outlined">{integration.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-body-md text-body-md font-bold text-primary">{integration.name}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">{integration.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(integration.id)}
                  className={`shrink-0 px-5 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-wider transition-all ${
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
        </div>
      </main>
      <Footer />
    </>
  );
}