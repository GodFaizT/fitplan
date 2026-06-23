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
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line px-6 py-12 text-center">
      {Icon ? <Icon className="h-8 w-8 text-text-muted" strokeWidth={1.5} /> : null}
      <div>
        <p className="text-text">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {action}
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
