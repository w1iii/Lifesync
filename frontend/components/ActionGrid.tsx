import type { Briefing } from "@/types";

interface Props {
  briefing?: Briefing | null;
}

export default function ActionGrid({ briefing }: Props) {
  const anomalies = briefing?.modules?.anomaly?.anomalies ?? [];
  const bills = briefing?.modules?.finance?.billsDue ?? [];
  const draftReplies = briefing?.modules?.inbox?.draftReplies ?? [];

  const actions = [
    ...anomalies.map((a) => ({
      id: a.id,
      icon: "notification_important" as const,
      iconBg: "bg-error-container text-on-error-container" as const,
      title: a.title,
      description: a.description,
      actionLabel: a.suggestedAction,
    })),
    ...bills.map((b) => ({
      id: b.name,
      icon: "receipt" as const,
      iconBg: "bg-tertiary-fixed text-on-tertiary-fixed" as const,
      title: b.name,
      description: `$${b.amount} due ${b.dueDate} (${b.daysUntilDue} days)`,
      actionLabel: "Pay",
    })),
    ...draftReplies.map((d) => ({
      id: d.id,
      icon: "reply" as const,
      iconBg: "bg-secondary-container text-on-secondary-container" as const,
      title: `Reply to ${d.to}`,
      description: d.subject,
      actionLabel: "Review Draft",
    })),
  ];

  if (actions.length === 0) {
    return (
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-gutter mt-16 px-margin-mobile">
        <div className="glass-card p-container-padding rounded-lg group hover:bg-secondary/5 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h3 className="font-body-md text-body-md font-bold text-primary">Routine Update</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            AI has optimized your evening workflow based on today&apos;s high productivity levels.
          </p>
          <div className="flex gap-2">
            <button className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm uppercase hover:opacity-90 transition-opacity">
              Review
            </button>
            <button className="border border-outline-variant px-4 py-2 rounded-full font-label-sm text-label-sm uppercase hover:bg-white/40 transition-colors">
              Dismiss
            </button>
          </div>
        </div>

        <div className="glass-card p-container-padding rounded-lg group hover:bg-secondary/5 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
              <span className="material-symbols-outlined">energy_savings_leaf</span>
            </div>
            <h3 className="font-body-md text-body-md font-bold text-primary">Eco Sync</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Your home environmental sensors report 100% harmony. Solar storage is at peak capacity.
          </p>
          <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm uppercase tracking-tighter">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>
            Fully Optimized
          </div>
        </div>

        <div className="glass-card p-container-padding rounded-lg group hover:bg-secondary/5 transition-all border-dashed">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined">add</span>
            </div>
            <h3 className="font-body-md text-body-md font-bold text-primary">Add Module</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Customize your morning briefing with new data streams and smart integrations.
          </p>
          <button className="w-full border-2 border-dashed border-outline-variant py-3 rounded-xl font-label-sm text-label-sm uppercase hover:border-secondary hover:text-secondary transition-all">
            Browse Marketplace
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-16 px-margin-mobile">
      {actions.map((action) => (
        <div key={action.id} className="glass-card p-container-padding rounded-lg group hover:bg-secondary/5 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${action.iconBg}`}>
              <span className="material-symbols-outlined">{action.icon}</span>
            </div>
            <h3 className="font-body-md text-body-md font-bold text-primary">{action.title}</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            {action.description}
          </p>
          <div className="flex gap-2">
            <button className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm text-label-sm uppercase hover:opacity-90 transition-opacity">
              {action.actionLabel}
            </button>
            <button className="border border-outline-variant px-4 py-2 rounded-full font-label-sm text-label-sm uppercase hover:bg-white/40 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
