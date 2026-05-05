"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-start to-accent-end" />
            <span className="text-text-secondary text-sm font-mono">
              Loading...
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
