import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'failed' | 'suspicious' | 'critical' | 'high' | 'medium' | 'low' | 'online' | 'offline';
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  success: 'bg-success/10 text-success border-success/20',
  online: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  suspicious: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-success/10 text-success border-success/20',
  offline: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
