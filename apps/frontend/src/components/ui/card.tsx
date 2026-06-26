import { cn } from '@/lib/cn';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'surface-elevated rounded-card border border-line p-4 sm:p-5',
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[18px] font-medium tracking-tight text-text', className)}
      {...props}
    />
  );
}

/**
 * Cabeçalho de página consistente (topo de cada ecrã). O tick lima é o
 * elemento-assinatura que se repete por toda a app. Entra com fade-up.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex animate-fade-up items-start justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        <span className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted">
          <span aria-hidden className="accent-bar h-2.5 w-1 rounded-pill" />
          {eyebrow}
        </span>
        <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-text sm:text-[26px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </header>
  );
}

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'text-[12px] font-normal uppercase tracking-[0.04em] text-text-muted',
        className,
      )}
      {...props}
    />
  );
}
