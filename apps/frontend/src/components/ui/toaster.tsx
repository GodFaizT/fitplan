'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useToastStore } from '@/lib/toast';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="safe-top pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-lg"
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-danger" />
            )}
            <span className="text-text">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
