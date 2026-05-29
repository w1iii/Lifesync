interface Props {
  connectedServices?: string[];
}

export default function Sidebar({ connectedServices = [] }: Props) {
  const isConnected = (s: string) => connectedServices.includes(s);

  return (
    <aside className="fixed left-4 top-24 bottom-4 w-20 flex flex-col items-center py-8 gap-8 z-40 bg-surface-container-low/60 backdrop-blur-2xl rounded-xl border border-white/20 shadow-xl shadow-secondary/5">
      <div className="flex flex-col items-center gap-6">
        <button className="bg-secondary/20 text-secondary rounded-full p-3 hover:scale-110 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
        </button>
        <button className="text-on-surface-variant/70 p-3 hover:bg-white/30 transition-all duration-300 rounded-full hover:scale-110 duration-200 relative">
          <span className="material-symbols-outlined">calendar_today</span>
          {isConnected("calendar") && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" />}
        </button>
        <button className="text-on-surface-variant/70 p-3 hover:bg-white/30 transition-all duration-300 rounded-full hover:scale-110 duration-200">
          <span className="material-symbols-outlined">favorite</span>
        </button>
        <button className="text-on-surface-variant/70 p-3 hover:bg-white/30 transition-all duration-300 rounded-full hover:scale-110 duration-200">
          <span className="material-symbols-outlined">insights</span>
        </button>
        <button className="text-on-surface-variant/70 p-3 hover:bg-white/30 transition-all duration-300 rounded-full hover:scale-110 duration-200 relative">
          <span className="material-symbols-outlined">sync_alt</span>
          {connectedServices.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" />}
        </button>
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-on-surface-variant/50">shield</span>
        <span className="material-symbols-outlined text-on-surface-variant/50">help</span>
      </div>
    </aside>
  );
}
