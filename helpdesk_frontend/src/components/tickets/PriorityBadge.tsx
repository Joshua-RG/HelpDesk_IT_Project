import { Badge } from '@/components/ui/badge';
import type { TicketPriority } from '@/types';

const config: Record<TicketPriority, { label: string; className: string }> = {
  LOW: {
    label: 'Low',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  },
  HIGH: {
    label: 'High',
    className: 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/20',
  },
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, className } = config[priority];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
