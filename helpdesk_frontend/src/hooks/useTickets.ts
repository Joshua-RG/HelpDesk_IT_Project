import { useState, useCallback, useEffect } from 'react';
import { ticketsApi } from '@/services/api';
import type { Ticket, CreateTicketPayload, TicketStatus } from '@/types';

export function useTickets(authenticated: boolean) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!authenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getAll() as any;
      
      setTickets(data.content || data || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = useCallback(async (payload: CreateTicketPayload): Promise<boolean> => {
    setError(null);
    try {
      const newTicket = await ticketsApi.create(payload);
      setTickets(prev => [newTicket, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      return false;
    }
  }, []);

  const updateStatus = useCallback(async (id: number, status: TicketStatus): Promise<boolean> => {
    setError(null);
    try {
      const updated = await ticketsApi.updateStatus(id, { status });
      setTickets(prev => prev.map(t => (t.id === id ? updated : t)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      return false;
    }
  }, []);

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    createTicket,
    updateStatus,
  };
}
