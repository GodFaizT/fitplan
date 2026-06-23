'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Diálogo centrado. Centrado (e não colado ao fundo) para o teclado do telemóvel
 * não tapar o conteúdo; com interactive-widget=resizes-content (ver layout), o
 * teclado reduz a área visível e o modal fica sempre visível por cima.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-medium">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-lg p-1 text-text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
