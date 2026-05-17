"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PageLoader } from "@/components/ui/spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [admin, loading, pathname, router]);

  if (loading || !admin) return <PageLoader />;

  return <>{children}</>;
}
