"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import AmbientOrbs from "@/components/AmbientOrbs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <>
      <AmbientOrbs />
      <Header />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="pt-28 pb-20 px-margin-desktop min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
}