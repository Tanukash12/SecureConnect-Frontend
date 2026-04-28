import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  color?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ name, color = '#667eea', isOnline, size = 'md', className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusSize = {
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-primary-foreground',
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-card',
            statusSize[size],
            isOnline ? 'status-online' : 'status-offline'
          )}
        />
      )}
    </div>
  );
}
