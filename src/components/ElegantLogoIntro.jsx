import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ElegantLogoIntro = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 600);
    const t3 = setTimeout(() => setStage(3), 1300);
    const t4 = setTimeout(() => { setStage(4); onComplete(); }, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 4 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-ivory"
        >
          {/* Logo Content */}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
            
            {/* Elegant Monogram */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: stage >= 1 ? 1 : 0.9, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative"
            >
              <div className="w-16 h-16 border border-charcoal/20 flex items-center justify-center font-display text-2xl font-light text-charcoal bg-white">
                C
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 8 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-1"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-light tracking-wide text-charcoal">
                Chaitrika
              </h1>
              <p className="text-micro uppercase tracking-[0.3em] text-ink-muted mt-1.5 font-medium">
                Bespoke Photo Framing
              </p>
            </motion.div>

            {/* Subtle Divider Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: stage >= 3 ? 48 : 0, opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="h-px bg-accent/40 my-1"
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="text-micro font-medium uppercase tracking-[0.25em] text-ink-muted"
            >
              Preserve Your Precious Memories
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ElegantLogoIntro;
