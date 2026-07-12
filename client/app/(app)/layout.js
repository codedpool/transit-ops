import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ToastProvider from "@/components/ToastProvider";
import { getSession } from "@/lib/api";

export default async function AppLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const { user, permissions } = session;

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar permissions={permissions} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
