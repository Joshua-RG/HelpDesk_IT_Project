import { useEffect } from 'react';
import { toast } from 'sonner';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import { NewTicketDialog } from '@/components/tickets/NewTicketDialog';
import { useAuthContext } from '@/context/AuthContext';
import { useTickets } from '@/hooks/useTickets';
import type { CreateTicketPayload, TicketStatus } from '@/types';

export function DashboardPage() {
  const { user, isAuthenticated } = useAuthContext();
  const { tickets, isLoading, error, createTicket, updateStatus } =
    useTickets(isAuthenticated);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleCreate(payload: CreateTicketPayload) {
    const ok = await createTicket(payload);
    if (ok) toast.success('Ticket created successfully');
    return ok;
  }

  async function handleUpdateStatus(id: number, status: TicketStatus) {
    const ok = await updateStatus(id, status);
    if (ok) toast.success(`Status updated to ${status.replace('_', ' ')}`);
    return ok;
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Tickets</h2>
        <p className="text-sm text-muted-foreground">
          {user?.role === 'IT_SUPPORT'
            ? 'Manage and resolve all support tickets.'
            : 'Track the status of your support requests.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} dotClass="bg-blue-500" />
        <StatCard label="In Progress" value={stats.inProgress} dotClass="bg-amber-500" />
        <StatCard label="Resolved" value={stats.resolved} dotClass="bg-emerald-500" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-medium">All Tickets</h3>
        <div className="flex gap-2">
          <NewTicketDialog onCreate={handleCreate} />
        </div>
      </div>

      <TicketsTable
        tickets={tickets}
        isLoading={isLoading}
        userRole={user?.role}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        {dotClass && <span className={`size-2 rounded-full ${dotClass}`} />}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
