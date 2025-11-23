import MobileNav from "@/components/mobile-nav";
import { AppHeader } from "@/components/app-header";
import { NotificationsProvider } from "@/components/notifications-provider";
import { NotificationsToast } from "@/components/notifications-toast";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <AppHeader />
        {children}
        <MobileNav />
        <NotificationsToast />
      </div>
    </NotificationsProvider>
  );
}

export default AppLayout;
