'use client';

import { Camera, GitCompare, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import {
  useProgressPhotos,
  useProgressPhotoMutations,
} from '@/hooks/use-progress-photos';
import { api } from '@/lib/api';
import { chartDate, dateLabel, todayISO } from '@/lib/format';
import { type CompressedImage, compressImage } from '@/lib/image';
import { toast } from '@/lib/toast';
import type { ProgressPhoto } from '@/lib/types';

/** Imagem servida por endpoint autenticado: busca o blob e usa um object URL. */
function AuthImage({
  id,
  alt,
  className,
}: {
  id: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let obj: string | null = null;
    api
      .getBlob(`/progress-photos/${id}/image`)
      .then((blob) => {
        if (!active) return;
        obj = URL.createObjectURL(blob);
        setUrl(obj);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (obj) URL.revokeObjectURL(obj);
    };
  }, [id]);

  if (!url) return <Skeleton className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}

export function PhotosTab() {
  const photos = useProgressPhotos();
  const { create, remove } = useProgressPhotoMutations();
  const fileRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<CompressedImage | null>(null);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [viewer, setViewer] = useState<ProgressPhoto | null>(null);
  const [compare, setCompare] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const img = await compressImage(file);
      setPending(img);
      setDate(todayISO());
      setNote('');
    } catch {
      toast.error('Não foi possível ler a imagem');
    }
  }

  async function savePhoto() {
    if (!pending) return;
    setBusy(true);
    try {
      await create.mutateAsync({
        date,
        note: note.trim() || undefined,
        dataUrl: pending.dataUrl,
        width: pending.width,
        height: pending.height,
      });
      toast.success('Foto guardada');
      setPending(null);
    } catch {
      toast.error('Não foi possível guardar a foto');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    if (!toDelete) return;
    remove.mutate(toDelete);
    setToDelete(null);
    setViewer(null);
  }

  if (photos.isLoading) return <Skeleton className="h-72 w-full" />;

  const list = photos.data ?? [];
  const oldest = list[list.length - 1];
  const newest = list[0];

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Sem fotos ainda"
          description="Adiciona a primeira para começares a ver a tua evolução lado a lado."
          action={
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              <Camera className="h-4 w-4" /> Adicionar foto
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {list.length} foto{list.length === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              {list.length >= 2 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompare(true)}
                >
                  <GitCompare className="h-4 w-4" /> Comparar
                </Button>
              ) : null}
              <Button size="sm" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => setViewer(p)}
                className="lift group relative overflow-hidden rounded-card border border-line"
              >
                <AuthImage
                  id={p.id}
                  alt={`Foto de ${chartDate(p.date.slice(0, 10))}`}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1.5 text-left text-[11px] font-medium text-white">
                  {dateLabel(p.date.slice(0, 10))}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal de nova foto */}
      <Modal
        open={!!pending}
        onClose={() => !busy && setPending(null)}
        title="Nova foto de progresso"
      >
        {pending ? (
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.dataUrl}
              alt="Pré-visualização"
              className="mx-auto max-h-64 rounded-xl object-contain"
            />
            <Field label="Data">
              <Input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Nota (opcional)">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ex: fim do cut, semana 8"
              />
            </Field>
            <Button onClick={savePhoto} disabled={busy}>
              {busy ? 'A guardar…' : 'Guardar foto'}
            </Button>
          </div>
        ) : null}
      </Modal>

      {/* Visualizador em ecrã inteiro */}
      {viewer
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
              <div className="safe-top flex items-center justify-between p-4 text-white">
                <span className="text-sm">
                  {dateLabel(viewer.date.slice(0, 10))}
                </span>
                <button onClick={() => setViewer(null)} aria-label="Fechar">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center p-3">
                <AuthImage
                  id={viewer.id}
                  alt=""
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>
              {viewer.note ? (
                <p className="px-4 pb-1 text-center text-sm text-white/80">
                  {viewer.note}
                </p>
              ) : null}
              <div className="safe-bottom p-4">
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setToDelete(viewer.id)}
                >
                  <Trash2 className="h-4 w-4" /> Remover foto
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Comparação antes / depois */}
      {compare && oldest && newest
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
              <div className="safe-top flex items-center justify-between p-4 text-white">
                <span className="text-sm">Antes / Depois</span>
                <button onClick={() => setCompare(false)} aria-label="Fechar">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 p-2">
                {[
                  { p: oldest, label: 'Antes' },
                  { p: newest, label: 'Depois' },
                ].map(({ p, label }) => (
                  <div key={p.id} className="flex min-h-0 flex-col">
                    <span className="pb-1 text-center text-[11px] text-white/70">
                      {label} · {chartDate(p.date.slice(0, 10))}
                    </span>
                    <AuthImage
                      id={p.id}
                      alt=""
                      className="min-h-0 w-full flex-1 rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover foto"
        description="Esta foto de progresso será apagada. Esta ação não pode ser anulada."
        confirmLabel="Remover"
      />
    </div>
  );
}
