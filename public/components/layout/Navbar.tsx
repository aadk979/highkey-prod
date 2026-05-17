"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { useCartCount } from "@/hooks/useCartCount"

export function Navbar() {
  const cartCount = useCartCount()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-surface border-b border-border shadow-sm" : "bg-transparent border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-[900px] mx-auto px-6 h-20 grid grid-cols-2 md:grid-cols-3 items-center">
        
        {/* 1. Brand Logo */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center">
            <Logo className="text-primary h-[32px] w-auto relative z-10" />
          </Link>
        </div>

        {/* 2. Cohesive Text Navigation */}
        <nav className="hidden md:flex justify-center items-center gap-8">
          <Link href="/shop" className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/about" className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/#how-it-works" className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground hover:text-primary transition-colors">
            Process
          </Link>
        </nav>

        {/* 3. Utility & CTA */}
        <div className="flex justify-end items-center gap-5">
          <Link href="/cart" className="relative text-foreground hover:text-primary transition-colors delay-75">
            <ShoppingBag size={18} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </motion.header>
  )
}
