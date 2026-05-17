import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  featured,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline p-6",
        featured ? "bg-surface-2" : "bg-surface-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-ink-subtle">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
