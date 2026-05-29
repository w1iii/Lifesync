"use client";

import { useEffect } from "react";
import Image from "next/image";
import LandingNav from "@/components/LandingNav";

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));

    const orbs = document.querySelectorAll<HTMLElement>(".orb");
    const onMove = (e: MouseEvent) => {
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.05;
        const x = (window.innerWidth - e.clientX * speed) / 100;
        const y = (window.innerHeight - e.clientY * speed) / 100;
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    document.addEventListener("mousemove", onMove);

    return () => {
      observer.disconnect();
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <LandingNav />

      <header className="relative min-h-[921px] flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="orb w-96 h-96 bg-secondary-container top-[-10%] left-[-5%]" />
        <div className="orb w-[500px] h-[500px] bg-tertiary-fixed bottom-[-20%] right-[-10%]" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block glass-panel px-4 py-1 rounded-full text-secondary font-label-sm text-label-sm">
              DIGITAL WELLNESS REIMAGINED
            </div>
            <h1 className="font-display-lg text-[56px] lg:text-[84px] leading-[1.1] text-primary">
              Wake up to <span className="italic font-light">clarity.</span>
            </h1>
            <p className="text-on-surface-variant max-w-lg font-body-md text-body-md">
              LifeSync harmonizes your digital environment with your natural circadian rhythm. Experience a tech ecosystem
              that grows with you, not against you.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/signup"
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-sm text-label-sm scale-95 active:scale-90 transition-transform flex items-center gap-2 shadow-lg shadow-primary/10"
              >
                Start Your Journey
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
              <button className="glass-panel px-8 py-4 rounded-full font-label-sm text-label-sm border border-secondary/20 text-secondary hover:bg-secondary/5 transition-colors">
                Watch the Film
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end mt-12 lg:mt-0 relative">
            <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px]">
              <div className="absolute inset-0 glass-panel rounded-full flex flex-col items-center justify-center border-2 border-white/40 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary-container/20 to-transparent" />
                <span className="text-on-surface-variant font-label-sm text-label-sm mb-2">Sync Status</span>
                <div className="font-display-lg text-[48px] md:text-[64px] text-primary">Full</div>
                <div className="w-4/5 h-[1px] bg-outline-variant/30 my-4" />
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">Optimized</span>
              </div>
              <div className="absolute top-0 left-[-20px] glass-panel w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center animate-bounce duration-[4s]">
                <span className="font-label-sm text-label-sm text-secondary">Pod 1</span>
              </div>
              <div className="absolute bottom-10 right-[-10px] glass-panel w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center animate-pulse duration-[3s]">
                <span className="font-label-sm text-label-sm text-secondary">Pod 2</span>
              </div>
              <div className="absolute bottom-[20%] left-[-40px] glass-panel w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center">
                <span className="font-label-sm text-label-sm text-secondary">Pod 3</span>
              </div>
              <div className="absolute inset-[-20%] bg-secondary-container/10 rounded-full blur-[60px] z-0" />
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Overnight Intelligence</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              While you rest, LifeSync recalibrates your digital atmosphere. Analyzing connectivity noise, blue light
              exposure, and ambient data to prepare your perfect morning.
            </p>
          </div>
          <button className="text-secondary font-label-sm text-label-sm underline underline-offset-8">
            Explore Analytics
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          <div className="md:col-span-8 glass-panel rounded-lg p-container-padding flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-secondary text-[48px] mb-4 inline-block">bedtime</span>
              <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Restorative Pulse</h3>
              <p className="text-on-surface-variant max-w-sm">
                Synchronizing your biological clock with smart environment controls for 28% better deep sleep.
              </p>
            </div>
            <div className="relative z-10 mt-12">
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-primary">94</span>
                <span className="text-secondary font-label-sm text-label-sm">SYNCHRONY INDEX</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3/4 h-1/2 opacity-20 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <path
                  className="text-secondary"
                  d="M0,150 Q50,120 100,160 T200,80 T300,120 T400,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </div>
            <Image
              className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:scale-110 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdt8c0u0pa4n-YsIlWmYYYOG2CNtVvOAP7T6UY-EdmGbvl7GBw7JUtVppRAKvv6HhtsmUINKBGkHGe9OsjLMKqQa0xZw0WOufMlT0j_glIYxrTtqFL4nthsE8uCd11as2D8q8iIk9xU6hfzJ68uVuXYOfaVq_S1St3y1esF6qzPxUZXPXN_hoZfvd07FZ0aJmVy48gNcGcGojkb9pP1OHrMhyGoRV5PWxG5l3IBAzJRbP-BLcgt2mbk8MleHl4vxo0TxMj9fBpM_o"
              alt="Peaceful bedroom at twilight"
              width={800}
              height={600}
              unoptimized
            />
          </div>
          <div className="md:col-span-4 grid grid-rows-2 gap-6">
            <div className="glass-panel rounded-lg p-8 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-secondary-container border-t-secondary animate-spin-slow mb-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">eco</span>
              </div>
              <span className="font-headline-lg text-headline-lg text-primary">
                600 <span className="text-label-sm uppercase">W/m³</span>
              </span>
              <p className="text-on-surface-variant font-label-sm text-label-sm">Solar Intensity</p>
            </div>
            <div className="glass-panel rounded-lg p-8 flex flex-col justify-center items-center text-center bg-secondary text-on-secondary">
              <span className="material-symbols-outlined text-[40px] mb-4 inline-block">device_thermostat</span>
              <span className="font-headline-lg text-headline-lg">
                28° <span className="text-label-sm">CELSIUS</span>
              </span>
              <p className="opacity-80 font-label-sm text-label-sm">Optimal Home Climate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">Module Integration</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto font-body-md text-body-md">
              Connect your existing life modules. Our organic architecture bridges the gap between hardware and headspace.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {[
              { icon: "light_mode", title: "Lumina Pods", desc: "Adaptive lighting that mimics natural sun cycles to regulate melatonin." },
              { icon: "air", title: "Atmospheric Hub", desc: "Purifies digital distractions while monitoring particulate matter." },
              { icon: "psychology", title: "Mind-Bridge", desc: "Non-invasive neuro-feedback to help transition from work to play." },
              { icon: "waves", title: "Sound Scape", desc: "Generative white noise tuned specifically to your house acoustics." },
            ].map((mod) => (
              <div
                key={mod.title}
                className="glass-panel p-8 rounded-lg group hover:bg-white transition-all duration-500"
              >
                <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined">{mod.icon}</span>
                </div>
                <h4 className="font-headline-lg text-[20px] text-primary mb-2">{mod.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{mod.desc}</p>
                <a
                  className="inline-flex items-center gap-2 font-label-sm text-label-sm text-secondary group-hover:gap-3 transition-all"
                  href="#"
                >
                  View Specs <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 order-2 md:order-1 relative">
            <div className="glass-panel rounded-lg overflow-hidden relative aspect-square shadow-2xl">
              <Image
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNhanbLIgJNh3Rf-NXrVCQ6NZvlV5w85CVAno1PSzdZLtIoUlK5zNyS1tdkstcieeb35sIdSVVwfxiz2YdmQEUQNHSlNAdaaNcyH_skL_6TT96PeCKPunliAfRz9iBJYXMysNVD9kFJ97BmudWvjpCTI-OHJIA--517y4QEYl9Cm6SsZ9SvDxstSEaJYVzQU_AYBP_HIPPBPBYZ03t5fOQxpCBcJaeAhq1uS25lxwJgOQkGiBCbn174SzW-oy41is7WbDdcRl6D2I"
                alt="Macro leaf with water droplets"
                width={800}
                height={800}
                unoptimized
              />
              <div className="absolute inset-0 bg-secondary/10" />
              <div className="absolute bottom-10 left-10 glass-panel p-6 rounded-lg max-w-xs border-l-4 border-secondary">
                <span className="material-symbols-outlined text-secondary mb-2 inline-block">verified</span>
                <p className="text-sm italic font-body-md text-on-surface italic">
                  &ldquo;Since LifeSync, my focus cycles have lengthened by 40% without any conscious effort.&rdquo;
                </p>
                <div className="mt-4 font-label-sm text-label-sm text-primary">&mdash; Elena M., Product Lead</div>
              </div>
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 border border-secondary/20 rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 border border-secondary/10 rounded-full" />
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 space-y-8 scroll-reveal">
            <h2 className="font-headline-lg text-[42px] leading-tight text-primary">
              Technology that feels <span className="text-secondary italic">grown</span>, not built.
            </h2>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
              We believe the most advanced technology should be invisible. Our &ldquo;Calm Tech&rdquo; philosophy ensures
              that notifications never interrupt, devices don&apos;t glow unless needed, and data serves your peace of
              mind rather than demanding your attention.
            </p>
            <ul className="space-y-4">
              {[
                "Zero-Interrupt Notification Layer",
                "Adaptive Luminance Control",
                "Privacy-First local processing",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-on-surface">
                  <span className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-secondary">check</span>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-6">
              <button className="bg-primary text-on-primary px-10 py-5 rounded-full font-label-sm text-label-sm hover:translate-y-[-2px] transition-all shadow-xl shadow-primary/5">
                Read Our Manifesto
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-tertiary-fixed/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-headline-lg text-headline-lg text-primary">Harmonize your life today.</h2>
          <p className="text-on-surface-variant text-body-md max-w-xl mx-auto">
            Join 50,000+ individuals who have traded digital chaos for synchronized tranquility.
          </p>
          <div className="glass-panel p-1 rounded-full inline-flex gap-1 mx-auto">
            <button className="px-8 py-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">
              Monthly
            </button>
            <button className="px-8 py-3 rounded-full text-on-surface-variant font-label-sm text-label-sm">
              Yearly (Save 20%)
            </button>
          </div>
          <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="glass-panel p-10 rounded-lg flex flex-col items-center">
              <div className="text-primary font-headline-lg text-[48px] mb-2">$0</div>
              <div className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">
                The Essence
              </div>
              <ul className="space-y-4 mb-8 text-on-surface-variant w-full">
                {["Core Sleep Sync", "Mobile App Access", "Basic Analytics"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">done</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-full border border-primary/20 text-primary font-label-sm text-label-sm hover:bg-primary/5 transition-colors">
                Select Plan
              </button>
            </div>
            <div className="glass-panel p-10 rounded-lg bg-white/80 border-2 border-secondary flex flex-col items-center relative">
              <div className="absolute top-0 right-10 translate-y-[-50%] bg-secondary text-on-secondary px-4 py-1 rounded-full text-[10px] font-bold tracking-tighter">
                MOST BALANCED
              </div>
              <div className="text-primary font-headline-lg text-[48px] mb-2">
                $19<span className="text-lg">/mo</span>
              </div>
              <div className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">
                The Harmony
              </div>
              <ul className="space-y-4 mb-8 text-on-surface-variant w-full">
                {[
                  "All Essence Features",
                  "Full Module Integration",
                  "Predictive Bio-Feedback",
                  "Lumina Pod Set (x2)",
                ].map((f) => (
                  <li key={f} className={`flex items-center gap-2 ${f.startsWith("Lumina") ? "font-bold text-primary" : ""}`}>
                    <span className="material-symbols-outlined text-secondary text-[18px]">done</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                Get Harmony
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-low w-full py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline-lg text-headline-lg text-primary">LifeSync</span>
            <p className="text-outline font-label-sm text-label-sm">
              &copy; 2024 LifeSync AI. Nurturing digital harmony.
            </p>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex gap-6">
              <a
                className="text-outline font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
                href="#"
              >
                Privacy
              </a>
              <a
                className="text-outline font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
                href="#"
              >
                Terms
              </a>
              <a
                className="text-outline font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity"
                href="#"
              >
                Support
              </a>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">public</span>
              </div>
              <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">mail</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
