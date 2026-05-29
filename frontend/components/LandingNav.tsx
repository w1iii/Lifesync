export default function LandingNav() {
  return (
    <nav className="bg-surface/60 backdrop-blur-xl w-full sticky top-0 z-50 border-b border-white/20 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop py-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-display-lg text-display-lg font-light text-primary">LifeSync</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">
            Product
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-body-md text-body-md"
            href="#"
          >
            Science
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-body-md text-body-md"
            href="#"
          >
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-body-md text-body-md"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm text-label-sm scale-95 active:scale-90 transition-transform inline-block"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
