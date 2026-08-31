import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({ label, value, trend, trendPositive = true }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
      {trend && (
        <p className={clsx('mt-1 text-xs font-medium', trendPositive ? 'text-success' : 'text-danger')}>
          {trend}
        </p>
      )}
    </div>
  );
}