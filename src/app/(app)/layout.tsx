import MobileNav from "@/components/mobile-nav";
import { AppHeader } from "@/components/app-header";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppHeader />
      {children}
      <MobileNav />
    </div>
  );
}

export default AppLayout;
