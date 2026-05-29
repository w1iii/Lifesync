export default function Footer() {
  return (
    <footer className="w-full py-gutter px-margin-desktop flex flex-col md:flex-row justify-between items-center bg-transparent border-t border-white/10 mt-12 mb-8">
      <div className="font-body-md text-body-md font-semibold text-primary mb-4 md:mb-0">
        © 2024 LifeSync AI. Harmony in data.
      </div>
      <div className="flex gap-8">
        <a className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">
          Privacy Policy
        </a>
        <a className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">
          Terms of Service
        </a>
        <a className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">
          Environmental Impact
        </a>
      </div>
    </footer>
  );
}
