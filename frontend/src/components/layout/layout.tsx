import type { ReactNode } from 'react';
import { FloatingNavbar } from '@/components/navbar/FloatingNavbar';
import { LayoutHeader } from './layout-header';


type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <LayoutHeader />
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {children}
      </main>
      <FloatingNavbar />
    </div>
  );
};

export default Layout;
