import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUserNotifications } from "@/lib/notifications";
import { NotificationsList } from "@/components/notifications-list";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const notifications = await getUserNotifications(session.user.id, 100);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notificaciones" },
          ]}
        />

        <div className="mt-4 sm:mt-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Notificaciones
          </h1>
          <NotificationsList initialNotifications={notifications} />
        </div>
      </div>
    </div>
  );
}

