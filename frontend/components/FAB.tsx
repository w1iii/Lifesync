interface Props {
  onClick?: () => void;
}

export default function FAB({ onClick }: Props) {
  return (
    <button onClick={onClick} className="fixed bottom-margin-desktop right-margin-desktop bg-gradient-to-br from-secondary to-tertiary text-on-secondary w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-secondary/40 hover:scale-110 active:scale-95 transition-all duration-300 group z-50">
      <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-500">add</span>
      <div className="absolute -top-12 right-0 bg-primary text-on-primary px-4 py-1 rounded-lg font-label-sm text-label-sm uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
        New Briefing
      </div>
    </button>
  );
}
