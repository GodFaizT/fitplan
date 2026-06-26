/** Compressão de imagens no cliente (antes do upload das fotos de progresso). */

export interface CompressedImage {
  dataUrl: string; // data:image/jpeg;base64,…
  width: number;
  height: number;
}

/**
 * Lê um ficheiro de imagem, redimensiona para `maxDim` no lado maior e devolve
 * um JPEG comprimido como data URL. Mantém a orientação via createImageBitmap.
 */
export async function compressImage(
  file: File,
  maxDim = 1080,
  quality = 0.8,
): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { dataUrl, width, height };
}
