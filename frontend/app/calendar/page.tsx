"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { Briefing } from "@/types";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function CalendarPage() {
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

  const schedule = briefing?.modules?.schedule;
  const meetings = schedule?.todaysMeetings ?? [];
  const conflicts = schedule?.conflicts ?? [];
  const overloaded = schedule?.estimatedOverload;
  const totalMinutes = schedule?.totalMeetingMinutes ?? 0;

  const conflictMeetingIds = new Set<string>();
  for (const c of conflicts) {
    conflictMeetingIds.add(c.meeting1);
    conflictMeetingIds.add(c.meeting2);
  }

  const hasData = meetings.length > 0;

  return (
    <>
      <AuthLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-secondary text-3xl">calendar_today</span>
            <div>
              <h1 className="font-display-lg text-display-lg text-primary">Calendar</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {hasData
                  ? `${meetings.length} meeting${meetings.length > 1 ? "s" : ""} today · ${formatDuration(totalMinutes)} total`
                  : "No meetings today"}
              </p>
            </div>
          </div>

          {overloaded && (
            <div className="glass-card p-4 rounded-xl mb-6 flex items-center gap-3 bg-error/10">
              <span className="material-symbols-outlined text-error">warning</span>
              <span className="font-body-md text-body-md text-error font-semibold">
                Heavy day — {formatDuration(totalMinutes)} of meetings scheduled
              </span>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="mb-6">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">merge_type</span>
                Conflicts
              </h2>
              <div className="space-y-3">
                {conflicts.map((c) => (
                  <div key={`${c.meeting1}-${c.meeting2}`} className="glass-card p-4 rounded-xl border-l-4 border-error">
                    <p className="font-body-md text-body-md text-primary font-bold">
                      {c.meeting1_title} ↔ {c.meeting2_title}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">{c.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasData && (
            <div className="glass-card p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 block">event_busy</span>
              <h2 className="font-display-sm text-display-sm text-primary mb-2">No Schedule Data</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                {briefing
                  ? "No meetings found for today."
                  : "Generate a briefing to see your schedule. Press the + button on the dashboard."}
              </p>
            </div>
          )}

          {hasData && (
            <div className="relative">
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
                Timeline
              </h2>
              <div className="space-y-3">
                {meetings.map((m) => {
                  const isConflict = conflictMeetingIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`glass-card p-4 rounded-xl flex items-start gap-4 transition-all hover:scale-[1.01] ${
                        isConflict ? "border-l-4 border-error" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-body-md text-body-md font-bold text-primary">{m.title}</h3>
                          {isConflict && (
                            <span className="text-[10px] font-bold uppercase text-error bg-error/10 px-2 py-0.5 rounded-full">
                              Conflict
                            </span>
                          )}
                          {m.priority === "high" && (
                            <span className="text-[10px] font-bold uppercase text-secondary bg-secondary-container px-2 py-0.5 rounded-full">
                              Priority
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="font-label-sm text-label-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {formatTime(m.start)} – {formatTime(m.end)}
                          </span>
                          {m.duration_minutes && (
                            <span className="font-label-sm text-label-sm">
                              · {formatDuration(m.duration_minutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AuthLayout>
    </>
  );
}