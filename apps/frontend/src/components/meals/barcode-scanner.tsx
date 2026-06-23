'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ScannerControls {
  stop: () => void;
}

/**
 * Lê um código de barras com a câmara (ZXing). Funciona em iOS/Android.
 * Chama onDetected com o código na primeira leitura.
 */
export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let controls: ScannerControls | undefined;
    let active = true;

    void (async () => {
      try {
        // import dinâmico: a lib só carrega no browser (evita problemas de SSR)
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result) => {
            if (result && active) {
              active = false;
              onDetectedRef.current(result.getText());
            }
          },
        );
      } catch {
        setError('Não foi possível aceder à câmara. Confirma as permissões.');
      }
    })();

    return () => {
      active = false;
      controls?.stop();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="safe-top flex items-center justify-between p-4 text-white">
        <span className="text-sm">Aponta a câmara ao código de barras</span>
        <button onClick={onClose} aria-label="Fechar">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-64 rounded-xl border-2 border-accent/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
        {error ? (
          <div className="absolute inset-x-4 bottom-10 rounded-xl border border-line bg-surface p-4 text-center text-sm text-text">
            {error}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
