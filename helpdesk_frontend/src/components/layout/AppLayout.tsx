import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from './AppSidebar';
import { useAuthContext } from '@/context/AuthContext';

export function AppLayout() {
  const { user } = useAuthContext();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">Dashboard</h1>
            <span className="text-xs text-muted-foreground">
              · {user?.role === 'IT_SUPPORT' ? 'IT Support' : 'Employee'} view
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium">{user?.username}</span>
              <span className="text-[11px] text-muted-foreground">{user?.email}</span>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 text-sm font-medium uppercase">
              {user?.username?.charAt(0) ?? '?'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
