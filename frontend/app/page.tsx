"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SummaryBar from "@/components/SummaryBar";
import OrbitSection from "@/components/OrbitSection";
import ActionGrid from "@/components/ActionGrid";
import NewsFeed from "@/components/NewsFeed";
import FAB from "@/components/FAB";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing, Preferences } from "@/types";
import { fetchLatestBriefing, generateBriefing, getPreferences, runDiagnostics } from "@/lib/api";

function storageKey(uid: string) { return `lifesync_briefing_${uid}`; }

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const persistBriefing = useCallback((data: Briefing | null, uid: string) => {
    if (data) {
      localStorage.setItem(storageKey(uid), JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    // Hydrate from localStorage instantly
    const cached = localStorage.getItem(storageKey(user.uid));
    if (cached) {
      try {
        setBriefing(JSON.parse(cached));
      } catch { /* ignore */ }
    }

    // Then try backend
    Promise.all([
      fetchLatestBriefing(user.uid).catch(() => null),
      getPreferences(user.uid).catch(() => null),
    ])
      .then(([briefingData, prefsData]) => {
        if (briefingData) {
          setBriefing(briefingData);
          persistBriefing(briefingData, user.uid);
        }
        if (prefsData) {
          setPreferences(prefsData);
        }
      })
      .finally(() => setLoading(false));
  }, [user, persistBriefing]);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".glass-card");
    const onEnter = (e: MouseEvent) => {
      const icon = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".material-symbols-outlined");
      if (icon) {
        icon.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        icon.style.transform = "scale(1.2)";
      }
    };
    const onLeave = (e: MouseEvent) => {
      const icon = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".material-symbols-outlined");
      if (icon) {
        icon.style.transform = "scale(1)";
      }
    };
    cards.forEach((card) => {
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
    });

    const orbs = document.querySelectorAll<HTMLElement>(".ambient-orb");
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 20;
      const y = (e.clientY / window.innerHeight) * 20;
      orbs.forEach((orb, index) => {
        const multiplier = (index + 1) * 2;
        orb.style.transform = `translate(${x * multiplier}px, ${y * multiplier}px)`;
      });
    };
    document.addEventListener("mousemove", onMove);

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const data = await generateBriefing(user.uid);
      setBriefing(data);
      persistBriefing(data, user.uid);
    } catch {
      setBriefing(null);
    }
    setGenerating(false);
  };

  const handleDiagnostics = async () => {
    if (!user || !briefing) return;
    setGenerating(true);
    try {
      const result = await runDiagnostics(user.uid, briefing.modules);
      setBriefing((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, modules: { ...prev.modules, anomaly: result } };
        persistBriefing(updated, user.uid);
        return updated;
      });
    } catch {
      // silent
    }
    setGenerating(false);
  };

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
      <Sidebar connectedServices={preferences?.connectedServices} />
      <main className="pt-28 pb-20 pl-32 pr-margin-desktop min-h-screen flex flex-col items-center">
        <SummaryBar briefing={briefing} />
          {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <OrbitSection briefing={briefing} onDiagnostics={handleDiagnostics} />
            {generating && (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Generating briefing...</span>
              </div>
            )}
          </>
        )}
        <ActionGrid briefing={briefing} />
        <NewsFeed briefing={briefing} />
      </main>
      <FAB onClick={handleGenerate} />
      <Footer />
    </>
  );
}
