import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("admin_session")?.value;
  const user = sessionId ? await getSessionUser(sessionId).catch(() => null) : null;

  // No session → render bare (middleware already redirects non-login paths)
  if (!user) return <>{children}</>;

  return (
    <AdminShell username={user.username} fullName={user.full_name} role={user.role}>
      {children}
    </AdminShell>
  );
}
