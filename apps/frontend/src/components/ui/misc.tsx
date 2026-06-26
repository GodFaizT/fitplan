import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line bg-surface/40 px-6 py-14 text-center">
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-7 w-7" strokeWidth={1.6} />
        </div>
      ) : null}
      <div>
        <p className="font-medium text-text">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

/** Pílula de cor para legendas de macro. */
export function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: color }}
    />
  );
}
