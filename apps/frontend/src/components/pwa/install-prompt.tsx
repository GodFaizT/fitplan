'use client';

import { Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'fitplan-install-dismissed';

/**
 * Prompt de instalação da PWA (PROJECT.md 9.2):
 * - Android/Chrome: botão "Instalar" via evento beforeinstallprompt.
 * - iOS/Safari: dica para "Adicionar ao ecrã principal".
 * Não reaparece depois de instalada ou dispensada.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      nav.standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios/i.test(ua);
    if (isIos && isSafari) {
      setShowIos(true);
      setHidden(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (hidden || (!deferred && !showIos)) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-20 z-50 mx-auto max-w-sm px-4 lg:bottom-6">
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg">
        <div className="mt-0.5 rounded-xl bg-accent/15 p-2 text-accent">
          {showIos ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Instalar o FitPlan</p>
          {showIos ? (
            <p className="mt-0.5 text-[13px] text-text-muted">
              Toca em <Share className="inline h-3.5 w-3.5" /> Partilhar e depois
              “Adicionar ao ecrã principal”.
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] text-text-muted">
              Adiciona ao ecrã principal e abre em ecrã inteiro.
            </p>
          )}
          {deferred ? (
            <button
              onClick={install}
              className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-text"
            >
              Instalar app
            </button>
          ) : null}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dispensar"
          className="rounded-lg p-1 text-text-muted hover:bg-surface-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
