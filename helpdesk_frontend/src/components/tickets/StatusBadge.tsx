import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '@/types';

const config: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20',
  },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={className}>
      <span className="size-1.5 rounded-full bg-current mr-1" />
      {label}
    </Badge>
  );
}
