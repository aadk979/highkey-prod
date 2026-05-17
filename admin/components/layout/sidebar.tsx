"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Key } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { mainNav } from "@/lib/constants/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const [financeOpen, setFinanceOpen] = useState(
    pathname.startsWith("/finance"),
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-hairline bg-canvas">
      <div className="flex h-14 items-center gap-2 border-b border-hairline px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-on-primary">
          <Key className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-primary">
          HighKey
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {mainNav.map((item) => {
          if (item.children) {
            const active = pathname.startsWith("/finance");
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => setFinanceOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-ink-muted hover:bg-surface-1 hover:text-ink",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      financeOpen && "rotate-180",
                    )}
                  />
                </button>
                {financeOpen ? (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-hairline pl-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm transition-colors",
                          pathname === child.href
                            ? "font-medium text-primary"
                            : "text-ink-subtle hover:text-ink",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-ink-muted hover:bg-surface-1 hover:text-ink",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
