"use client"

import React, { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowDown } from "lucide-react"
import { JsonLd } from "@/components/seo/JsonLd"
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": absoluteUrl("/#webpage"),
            name: "Highkey upcycled denim keychains",
            url: absoluteUrl("/"),
            description:
              "Customizable keychains made from reclaimed denim and finished with patches.",
            isPartOf: {
              "@id": absoluteUrl("/#website"),
            },
          },
          breadcrumbJsonLd([{ name: "Home", path: "/" }]),
        ]}
      />
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center overflow-hidden pt-12 pb-24 px-6 bg-background text-foreground">
        <div className="absolute inset-0 pointer-events-none opacity-4 mix-blend-multiply" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} 
        />
        
        <div className="max-w-[900px] w-full mx-auto flex flex-col items-center text-center z-10">
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="text-[15.36px] tracking-[1.54px] text-primary font-bold uppercase mb-6"
          >
            UPCYCLED DENIM · MADE FOR YOU
          </motion.p>
          
          <h1 className="font-heading font-light text-5xl md:text-[96px] leading-[1.1] text-foreground mb-6">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
                Your keys deserve
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block italic font-serif text-primary" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
                a second life.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-muted text-lg md:text-[20px] font-medium tracking-wide mb-10 max-w-[600px]"
          >
            Handcut denim keychains. Yours to customize.
          </motion.p>

          <motion.div 
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut", delay: 0.8 }}
            className="flex flex-row gap-4 justify-center items-center"
          >
            <Link href="/shop">
              <Button size="lg" className="rounded-full shadow-multi">
                Build Yours &rarr;
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="ghost-outline" className="rounded-full bg-white hover:bg-surface">
                How it works
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-12 mt-12 animate-bounce flex flex-col items-center gap-2"
          >
            <ArrowDown className="text-primary w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* Marquee Strip */}
      <section className="bg-section w-full h-[48px] flex items-center overflow-hidden border-y border-border">
        <motion.div 
          className="flex whitespace-nowrap gap-12 text-primary font-heading text-xl uppercase tracking-[2px]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
        >
          {Array(8).fill("DENIM REBORN · PATCH IT UP · CARRY YOUR STORY · HIGHKEY ·").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </section>

      {/* Product Showcase Section — "The Base" */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-10 gap-12 items-center bg-surface p-8 md:p-12 rounded-[12px] border border-border shadow-multi relative overflow-hidden">
          <div className="md:col-span-6 relative aspect-[5/3] flex items-center justify-center">
             <motion.div 
               whileHover={{ rotate: 1, scale: 1.02 }}
               className="w-[70%] aspect-[12/5] rounded-[24px] shadow-hover border-2 border-dashed border-border flex items-center justify-center overflow-hidden -rotate-3"
             >
               <div className="absolute inset-0 bg-opacity-80 bg-[#1d3557] mix-blend-multiply transition-colors duration-500 z-10" />
               <img src="/example_denim.jpeg" alt="Close-up texture of reclaimed denim used for Highkey keychains" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80" />
               <span className="relative z-20 font-heading text-white text-xl uppercase tracking-widest mix-blend-overlay">The Canvas</span>
             </motion.div>
             <div className="absolute -bottom-8 flex gap-3 shadow-sm bg-white p-2 border border-border rounded-full">
                <button className="w-8 h-8 rounded-full bg-[#1d3557] ring-2 ring-primary ring-offset-2 transition-transform hover:scale-110" />
                <button className="w-8 h-8 rounded-full bg-[#e0e1dd] hover:scale-110 transition-transform" />
                <button className="w-8 h-8 rounded-full bg-[#14213d] hover:scale-110 transition-transform" />
             </div>
          </div>
          <div className="md:col-span-4 flex flex-col items-start text-left">
            <h2 className="font-heading font-light text-[42px] leading-tight text-foreground mb-4">Start with the fabric.</h2>
            <p className="text-muted text-[18px] mb-6">Choose from genuine upcycled denim variants, each with its own character. Your canvas for self-expression, cut directly from reclaimed jeans.</p>
            <Link href="/shop" className="text-primary font-medium hover:underline flex items-center gap-1">
              Shop upcycled denim keychains &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Stepper Section */}
      <section id="how-it-works" className="py-24 px-6 bg-section">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
              { num: "01", title: "Pick your base", desc: "Choose from our denim variants, each with its own personality." },
              { num: "02", title: "Add your patches", desc: "Animals, characters, and bold art. Build your design entirely online." },
              { num: "03", title: "Carry it", desc: "A one-of-a-kind accessory shipped to you, ready for your keys." }
            ].map((step, i) => (
              <StepCard key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Material Philosophy */}
      <section className="bg-[#0D0D0D] py-32 px-6">
        <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-white font-heading font-light text-4xl md:text-[70px] leading-[1.1] mb-8">
            Every keychain starts as someone&apos;s forgotten jeans.
          </h2>
          <p className="text-[#8C8278] text-[18px] max-w-[600px] mb-16">
            We don&apos;t manufacture fabric. We hunt for it. Each cut is hand-selected from discarded vintage denim, washed, sanitized, and reinforced to outlast the keys it holds.
          </p>
          <div className="grid grid-cols-3 gap-4 w-full mb-16">
            <div className="h-[200px] rounded-lg border-2 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A]">
               <img src="/example_denim.jpeg" alt="Dark wash reclaimed denim sample for a keychain base" className="w-full h-full object-cover filter brightness-75" />
            </div>
            <div className="h-[200px] rounded-lg border-2 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A]">
               <img src="/example_denim.jpeg" alt="Reclaimed denim fabric variation prepared for hand cutting" className="w-full h-full object-cover grayscale contrast-125 brightness-50" />
            </div>
            <div className="h-[200px] rounded-lg border-2 border-[#1A1A1A] overflow-hidden bg-[#1A1A1A]">
               <img src="/example_denim.jpeg" alt="Washed denim texture used in Highkey upcycled accessories" className="w-full h-full object-cover filter contrast-[1.1] sepia-[0.2]" />
            </div>
          </div>
          <div className="w-[80px] h-[1px] bg-primary" />
        </div>
      </section>

    </div>
  )
}

type Step = {
  num: string;
  title: string;
  desc: string;
};

function StepCard({ step, index }: { step: Step, index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[8px] p-8 border border-border shadow-sm flex flex-col relative"
    >
      <span className="font-heading font-light text-[70px] text-primary mb-4 leading-none">{step.num}</span>
      <h3 className="font-heading font-medium text-2xl text-foreground mb-3">{step.title}</h3>
      <p className="text-muted leading-relaxed">{step.desc}</p>
    </motion.div>
  )
}
