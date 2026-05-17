"use client"

import React from "react"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero */}
      <section className="bg-[#0D0D0D] text-white pt-40 pb-32 px-6">
        <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-light text-5xl md:text-[70px] leading-[1.1] mb-8"
          >
            Jeans that lived a life.<br/>
            Keychains that carry one.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#8C8278] text-[18px] max-w-[600px]"
          >
            Highkey started with a simple observation: some of the best, most durable denim ever made was ending up in landfills. We decided to rescue it, cut it, and turn it into something you touch every single day.
          </motion.p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="bg-surface py-32 px-6 border-b border-border">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            
            {[
              { num: "01", title: "Upcycled", desc: "Every piece is cut from reclaimed vintage denim. No new water wasted, no new dyes used. Just pure salvage." },
              { num: "02", title: "Handcrafted", desc: "Assembled locally in our studio. We wash, sanitize, and reinforce each swatch to ensure it survives daily wear." },
              { num: "03", title: "Yours", desc: "Because we use vintage stock, no two keychains are exactly identical. Your piece carries a history uniquely yours." }
            ].map((val, i) => (
              <motion.div 
                key={val.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col text-left"
              >
                <span className="font-heading font-light text-[60px] text-primary mb-2 leading-none">{val.num}</span>
                <h3 className="font-heading font-medium text-2xl text-foreground mb-4">{val.title}</h3>
                <p className="text-muted leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* Manifesto Pullquote */}
      <section className="bg-section py-32 px-6 flex items-center justify-center">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center">
          <div className="w-[60px] h-[1px] bg-primary mb-12" />
          <h2 className="font-heading font-light italic text-4xl md:text-[48px] text-foreground leading-tight">
            "Highkey isn't about making new things. It's about seeing the life still left in old ones."
          </h2>
        </div>
      </section>

    </div>
  )
}
