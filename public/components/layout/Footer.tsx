import React from "react"
import Link from "next/link"
import { Logo } from "@/components/Logo"

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto pt-20 pb-10 px-6">
      <div className="max-w-[900px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <Logo className="text-primary h-[32px] w-auto" />
            <p className="text-muted text-sm max-w-[240px] leading-relaxed">
              Customizable upcycled denim keychains and accessories cut from discarded jeans.
            </p>
          </div>
          
          {/* Column 2: Shop */}
          <div className="flex flex-col gap-3 items-center md:items-start">
            <span className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Shop</span>
            <Link href="/shop" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">Upcycled Denim Keychains</Link>
            <Link href="/#how-it-works" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">Custom Keychain Process</Link>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-3 items-center md:items-start">
            <span className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Company</span>
            <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">About Highkey</Link>
            <Link href="/order" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">Track Order</Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-6 pt-6 border-t border-border">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Highkey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
