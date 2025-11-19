import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function HeroSection02() {
  return (
    <section className="relative w-full min-h-[20vh] flex flex-col items-center justify-center px-6 py-8 overflow-hidden bg-black">
      <DotPattern className={cn(
        "[mask-image:radial-gradient(40vw_circle_at_center,white,transparent)]",
      )} />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.4 }}
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-white/10 blur-[120px] rounded-full z-0"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-white/5 blur-[160px] rounded-full z-0"
      />
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 0.1, y: [0, -20, 0] }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 text-center max-w-2xl space-y-6">
        {/* Empty - section removed as requested */}
      </div>
    </section>
  );
}

