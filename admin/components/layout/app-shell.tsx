"use client";

import { useAuth } from "@/contexts/auth-context";
import { PageLoader } from "@/components/ui/spinner";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
