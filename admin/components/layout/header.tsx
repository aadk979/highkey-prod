"use client";

import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function Header({ title }: { title: string }) {
  const { admin, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-canvas px-6">
      <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <User className="size-4" />
          <span>{admin?.name ?? admin?.email}</span>
          {admin?.role === "super_admin" ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Super Admin
            </span>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
