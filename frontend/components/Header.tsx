import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface/40 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="font-headline-lg text-headline-lg font-light tracking-tighter text-primary">
        LifeSync AI
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <a className="font-body-md text-body-md text-secondary font-bold border-b-2 border-secondary" href="#">
          Dashboard
        </a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">
          Health
        </a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">
          Environment
        </a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">
          Wellness
        </a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-bright/50 transition-all duration-300 rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
        </button>
        <button className="p-2 hover:bg-surface-bright/50 transition-all duration-300 rounded-full relative">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>
        <Image
          alt="User Profile Avatar"
          className="w-10 h-10 rounded-full border-2 border-white/40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtrgyTHfdeqPhCwwwkI5OWmr40LjFIJmKGdzizK_v6r0cgGqd9JUdQPO4qyDxr9qwVR8dN7SfzbN_qq_FQlDQR1n24AJrJGVE_2SDfHjvT0lRrhlgji90ckWabH7Vj2xZ8WFPzMHA9I1O_QVeiMaY9sebeH9-eOtf7EA_2tJtHUtawKZSzUR5ooPcaYRoS1ueRwhiqAUXdE7_Cys3Ct5VL5x7sQSaKWxTwNdNzAEXF9Gi0soV90dd-CUhH8k5SIhNsFVtum4CNZD4"
          width={40}
          height={40}
        />
      </div>
    </header>
  );
}
