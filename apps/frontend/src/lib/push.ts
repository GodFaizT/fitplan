'use client';

import { api } from './api';
import { vapidPublicKey } from './runtime-env';

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    vapidPublicKey().length > 0
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** O browser tem uma subscrição push ativa? */
export async function pushStatus(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return !!sub;
}

/** Pede permissão, subscreve e regista no backend. Devolve true se ativou. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey()) as BufferSource,
  });
  const json = sub.toJSON();
  await api.post('/notifications/subscribe', {
    endpoint: json.endpoint,
    keys: json.keys,
  });
  return true;
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await api
    .post('/notifications/unsubscribe', { endpoint: sub.endpoint })
    .catch(() => undefined);
  await sub.unsubscribe();
}

export async function sendTestPush(): Promise<void> {
  await api.post('/notifications/test');
}
