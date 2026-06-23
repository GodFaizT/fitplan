'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ScannerControls {
  stop: () => void;
}

// Códigos de barras de produtos alimentares (1D).
const PRODUCT_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

const CAMERA: MediaStreamConstraints = {
  video: {
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

/**
 * Lê um código de barras de produto. Usa o detetor nativo do browser quando
 * disponível (Android: rápido e preciso) e o ZXing afinado para formatos de
 * produto como fallback (iOS). Chama onDetected na primeira leitura.
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
    let active = true;
    let stream: MediaStream | undefined;
    let zxControls: ScannerControls | undefined;

    const hit = (code: string) => {
      if (active && code) {
        active = false;
        onDetectedRef.current(code);
      }
    };

    void (async () => {
      // 1) Detetor nativo (BarcodeDetector) — onde houver suporte a EAN/UPC.
      const Detector = (
        window as unknown as { BarcodeDetector?: new (o: unknown) => unknown }
      ).BarcodeDetector as
        | (new (o: unknown) => {
            detect: (s: unknown) => Promise<{ rawValue: string }[]>;
          })
        | undefined;

      let useNative = false;
      if (Detector) {
        try {
          const getFormats = (
            Detector as unknown as { getSupportedFormats?: () => Promise<string[]> }
          ).getSupportedFormats;
          const supported = getFormats ? await getFormats() : undefined;
          useNative =
            !supported || PRODUCT_FORMATS.some((f) => supported.includes(f));
        } catch {
          useNative = false;
        }
      }

      if (useNative && Detector) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(CAMERA);
          const video = videoRef.current!;
          video.srcObject = stream;
          await video.play();
          const detector = new Detector({ formats: PRODUCT_FORMATS });
          const loop = async () => {
            if (!active) return;
            try {
              const codes = await detector.detect(video);
              if (codes && codes.length) {
                hit(codes[0].rawValue);
                return;
              }
            } catch {
              /* frame ainda não pronto */
            }
            requestAnimationFrame(loop);
          };
          requestAnimationFrame(loop);
          return;
        } catch {
          stream?.getTracks().forEach((t) => t.stop());
          stream = undefined;
          // cai para o ZXing
        }
      }

      // 2) ZXing afinado para formatos de produto (fallback, ex: iOS Safari).
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const { BarcodeFormat, DecodeHintType } = await import('@zxing/library');
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserMultiFormatReader(hints);
        zxControls = await reader.decodeFromConstraints(
          CAMERA,
          videoRef.current!,
          (result) => {
            if (result) hit(result.getText());
          },
        );
      } catch {
        setError('Não foi possível aceder à câmara. Confirma as permissões.');
      }
    })();

    return () => {
      active = false;
      zxControls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
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
          <div className="h-28 w-72 rounded-xl border-2 border-accent/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
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
