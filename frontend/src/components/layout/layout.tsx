import type { ReactNode } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navbar/app-sidebar';
import { LayoutHeader } from './layout-header';


type LayoutProps = {
  children: ReactNode;
};

const MainContent = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarInset className="ms-page">
      <LayoutHeader />
      <main className="ms-container">
        {children}
      </main>
    </SidebarInset>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
};

export default Layout;
