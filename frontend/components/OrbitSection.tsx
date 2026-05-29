import type { Briefing } from "@/types";

interface Props {
  briefing?: Briefing | null;
}

export default function OrbitSection({ briefing }: Props) {
  const inboxCount = briefing?.modules?.inbox?.totalEmails ?? 12;
  const financeStatus = briefing?.modules?.finance?.totalSpent != null ? `$${briefing.modules.finance.totalSpent}` : "Stable";
  const nextMeeting = briefing?.modules?.schedule?.todaysMeetings?.[0];
  const totalAnomalies = briefing?.modules?.anomaly?.totalAnomalies ?? 0;
  const allClear = totalAnomalies === 0;
  const meetingTitle = nextMeeting?.title ?? "Deep Focus Session";
  const meetingTime = nextMeeting?.start
    ? new Date(nextMeeting.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "09:00 AM";

  return (
    <div className="relative w-full flex justify-center items-center py-12">
      <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-white/30 pointer-events-none hidden lg:block" />

      <div className="lg:absolute lg:top-0 lg:left-0 z-20 float-animation" style={{ animationDelay: "-1s" }}>
        <div className="glass-card w-40 h-40 rounded-full flex flex-col items-center justify-center p-4 text-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontSize: "32px" }}>mail</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Inbox</span>
          <span className="font-headline-lg text-headline-lg text-primary">{inboxCount}</span>
        </div>
      </div>

      <div className="lg:absolute lg:bottom-10 lg:left-10 z-20 float-animation" style={{ animationDelay: "-3s" }}>
        <div className="glass-card w-48 h-48 rounded-full flex flex-col items-center justify-center p-4 text-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontSize: "32px" }}>payments</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Finance</span>
          <span className="font-body-md text-body-md text-primary font-bold">{financeStatus}</span>
          <div className="w-12 h-1 bg-secondary-container mt-2 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-secondary" />
          </div>
        </div>
      </div>

      <div className="relative z-30 group">
        <div className="central-disk w-[360px] h-[360px] md:w-[420px] md:h-[420px] rounded-full flex flex-col items-center justify-center transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-secondary/20">
          <div className="text-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.3em] mb-4 block">
              Morning Cycle
            </span>
            <h1 className="font-display-lg text-display-lg text-primary mb-2">
              {allClear ? "All Clear" : `${totalAnomalies} Issue${totalAnomalies > 1 ? "s" : ""}`}
            </h1>
            <p className="font-body-md text-body-md text-on-tertiary-container italic">
              {allClear ? "System Optimized" : "Attention Needed"}
            </p>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="48" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <circle
              className="text-secondary opacity-60"
              cx="50" cy="50" fill="none" r="48"
              stroke="currentColor"
              strokeDasharray="301.6"
              strokeDashoffset="60"
              strokeWidth="2"
            />
          </svg>
          <div className="mt-8 bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 cursor-pointer">
            Run Diagnostics
          </div>
        </div>
      </div>

      <div className="lg:absolute lg:top-10 lg:right-10 z-20 float-animation" style={{ animationDelay: "-2s" }}>
        <div className="glass-card w-52 h-52 rounded-full flex flex-col items-center justify-center p-6 text-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontSize: "32px" }}>event_note</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Next Event</span>
          <p className="font-body-md text-body-md text-primary font-bold line-clamp-2 mt-1">{meetingTitle}</p>
          <p className="font-label-sm text-label-sm text-on-tertiary-container mt-1">{meetingTime}</p>
        </div>
      </div>

      <div className="lg:absolute lg:bottom-0 lg:right-0 z-20 float-animation" style={{ animationDelay: "-4.5s" }}>
        <div className="glass-card w-44 h-44 rounded-full flex flex-col items-center justify-center p-4 text-center hover:scale-105 transition-transform cursor-pointer">
          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontSize: "32px" }}>ecg_heart</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Wellness</span>
          <span className="font-headline-lg text-headline-lg text-primary">94%</span>
        </div>
      </div>
    </div>
  );
}
