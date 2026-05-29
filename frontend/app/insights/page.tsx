"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing } from "@/types";

export default function InsightsPage() {
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

  const inbox = briefing?.modules?.inbox;
  const finance = briefing?.modules?.finance;
  const schedule = briefing?.modules?.schedule;
  const news = briefing?.modules?.news;
  const anomalies = briefing?.modules?.anomaly?.anomalies ?? [];
  const critical = briefing?.modules?.anomaly?.criticalCount ?? 0;
  const high = briefing?.modules?.anomaly?.highCount ?? 0;
  const hasData = briefing != null;

  const modules = [
    {
      name: "Inbox",
      icon: "mail",
      stats: [
        { label: "Total emails", value: inbox?.totalEmails ?? "—" },
        { label: "Needs attention", value: inbox?.needsAttention ?? "—" },
        { label: "Draft replies", value: inbox?.draftReplies?.length ?? "—" },
      ],
    },
    {
      name: "Finance",
      icon: "payments",
      stats: [
        { label: "Total spent", value: finance?.totalSpent != null ? `$${finance.totalSpent}` : "—" },
        { label: "Bills due", value: finance?.billsDue?.length ?? "—" },
        { label: "Portfolio", value: finance?.portfolioChange ?? "—" },
      ],
    },
    {
      name: "Schedule",
      icon: "event_note",
      stats: [
        { label: "Meetings today", value: schedule?.totalMeetings ?? "—" },
        { label: "Total time", value: schedule?.totalMeetingMinutes != null ? `${Math.round(schedule.totalMeetingMinutes / 60)}h` : "—" },
        { label: "Conflicts", value: schedule?.conflicts?.length ?? "—" },
      ],
    },
    {
      name: "News",
      icon: "rss_feed",
      stats: [
        { label: "Articles", value: news?.totalArticles ?? "—" },
        { label: "Topics", value: news?.topics?.length ?? "—" },
      ],
    },
  ];

  return (
    <>
      <AuthLayout>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">insights</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Insights</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Cross-module analysis and intelligence
              </p>
            </div>
          </div>

          {!hasData && (
            <div className="glass-card p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 block">insights</span>
              <h2 className="font-display-sm text-display-sm text-primary mb-2">No Data Yet</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Generate a briefing from the dashboard to see your insights.
              </p>
            </div>
          )}

          {hasData && (
            <>
              {(anomalies.length > 0 || critical > 0 || high > 0) && (
                <div className="glass-card p-6 rounded-xl mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="material-symbols-outlined text-error">notification_important</span>
                    <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                      Anomalies
                    </h2>
                    <div className="flex gap-2 ml-auto">
                      {critical > 0 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-error text-on-error">
                          {critical} Critical
                        </span>
                      )}
                      {high > 0 && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-error-container text-on-error-container">
                          {high} High
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {anomalies.map((a) => (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container">
                        <span className={`material-symbols-outlined mt-0.5 ${a.severity === "critical" || a.severity === "high" ? "text-error" : "text-secondary"}`}>
                          {a.severity === "critical" || a.severity === "high" ? "warning" : "info"}
                        </span>
                        <div className="min-w-0">
                          <p className="font-body-md text-body-md font-bold text-primary">{a.title}</p>
                          <p className="font-body-md text-body-md text-on-surface-variant text-sm">{a.description}</p>
                          <p className="text-xs text-secondary mt-1">{a.suggestedAction}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ml-auto shrink-0 ${
                          a.severity === "critical" ? "bg-error text-on-error" :
                          a.severity === "high" ? "bg-error-container text-on-error-container" :
                          "bg-surface-container-high text-on-surface-variant"
                        }`}>
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
                Module Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
                {modules.map((mod) => (
                  <div key={mod.name} className="glass-card p-5 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-secondary">{mod.icon}</span>
                      <span className="font-label-sm text-label-sm text-primary font-bold">{mod.name}</span>
                    </div>
                    <div className="space-y-2">
                      {mod.stats.map((s) => (
                        <div key={s.label} className="flex justify-between items-center">
                          <span className="text-xs text-on-surface-variant">{s.label}</span>
                          <span className="font-body-md text-body-md font-bold text-primary">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {schedule?.estimatedOverload && (
                <div className="glass-card p-5 rounded-xl mb-6 flex items-center gap-3 bg-error/10">
                  <span className="material-symbols-outlined text-error">schedule</span>
                  <div>
                    <p className="font-body-md text-body-md font-bold text-primary">Schedule Overload</p>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                      {schedule.totalMeetings} meetings totaling {Math.round((schedule.totalMeetingMinutes || 0) / 60)} hours today.
                      Consider rescheduling or blocking focus time.
                    </p>
                  </div>
                </div>
              )}

              <div className="glass-card p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary">lightbulb</span>
                  <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {anomalies.length > 0 ? (
                    anomalies.slice(0, 3).map((a) => (
                      <div key={`rec-${a.id}`} className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">arrow_forward</span>
                        <span>{a.suggestedAction}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-on-surface-variant">No recommendations — everything looks good.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </AuthLayout>
    </>
  );
}