"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ComboCounterProps {
  combo: number;
  showPop?: boolean;
}

export function ComboCounter({ combo, showPop = false }: ComboCounterProps) {
  if (combo === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        className="flex items-center gap-2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <span className="text-xs text-gray-400 uppercase">Combo</span>
        <motion.span
          className="text-2xl font-black neon-text-gold"
          animate={showPop ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {combo}
        </motion.span>
        {combo >= 3 && (
          <motion.span
            className="text-lg"
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            🔥
          </motion.span>
        )}
        {combo >= 5 && (
          <motion.span
            className="text-lg"
            initial={{ rotate: 30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
          >
            ⚡
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
