import type { Briefing } from "@/types";

interface Props {
  briefing?: Briefing | null;
}

export default function SummaryBar({ briefing }: Props) {
  const urgentCount = briefing?.modules?.inbox?.needsAttention ?? 3;
  const billsCount = briefing?.modules?.finance?.billsDue?.length ?? 2;
  const anomalyCount = briefing?.modules?.anomaly?.totalAnomalies ?? 1;

  return (
    <section className="w-full max-w-4xl flex justify-center gap-4 mb-12">
      <div className="glass-card px-6 py-2 rounded-full flex items-center gap-2 group hover:bg-white/60 transition-all cursor-default">
        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {urgentCount} Urgent
        </span>
      </div>
      <div className="glass-card px-6 py-2 rounded-full flex items-center gap-2 group hover:bg-white/60 transition-all cursor-default">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {billsCount} Bills
        </span>
      </div>
      <div className="glass-card px-6 py-2 rounded-full flex items-center gap-2 group hover:bg-white/60 transition-all cursor-default">
        <span className="w-2 h-2 rounded-full bg-primary-container" />
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          {anomalyCount} Anomaly
        </span>
      </div>
    </section>
  );
}
