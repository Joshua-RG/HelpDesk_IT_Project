import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDownIcon, CheckIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import type { Ticket, TicketStatus, UserRole } from '@/types';

const ALL_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

interface TicketsTableProps {
  tickets: Ticket[];
  isLoading: boolean;
  userRole?: UserRole;
  onUpdateStatus: (id: number, status: TicketStatus) => Promise<boolean>;
}

function buildColumns(
  userRole: UserRole | undefined,
  onUpdateStatus: (id: number, status: TicketStatus) => Promise<boolean>
): ColumnDef<Ticket>[] {
  const cols: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          #{row.original.id}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 data-[state=open]:bg-accent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm leading-snug">{row.original.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: 'authorName',
      header: 'Reported by',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.authorName || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.original.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  if (userRole === 'IT_SUPPORT') {
    cols.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Set Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_STATUSES.map(s => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onUpdateStatus(ticket.id, s)}
                  className="gap-2"
                >
                  {ticket.status === s && <CheckIcon className="size-3.5" />}
                  {s.replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return cols;
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TicketsTable({
  tickets,
  isLoading,
  userRole,
  onUpdateStatus,
}: TicketsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = buildColumns(userRole, onUpdateStatus);

  const table = useReactTable({
    data: tickets,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search tickets…"
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="hover:bg-transparent border-b">
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="bg-muted/40 text-xs font-medium">
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingRows />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && (
        <p className="text-xs text-muted-foreground px-1">
          {table.getFilteredRowModel().rows.length} ticket
          {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
