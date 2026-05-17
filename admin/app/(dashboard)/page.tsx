"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { mainNav } from "@/lib/constants/navigation";

const quickLinks = mainNav.filter((n) => n.href !== "/");

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="mb-8">
        <p className="text-ink-muted">
          Welcome to HighKey Admin. Manage your store from one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:border-primary/30 hover:bg-surface-2">
              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{item.label}</h3>
                  <p className="mt-1 text-sm text-ink-subtle">
                    View and manage {item.label.toLowerCase()}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
