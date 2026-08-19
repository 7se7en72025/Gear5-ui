"use client";

import { motion } from "framer-motion";
/* eslint-disable @next/next/no-img-element */
import {
  Palette,
  Terminal,
  Sparkles,
  Shield,
  ArrowRight,
  Star,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="Gear5" className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-tight text-white">
            Gear5 UI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/docs"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Docs
          </a>
          <a
            href="https://github.com/7se7en72025/Gear5-ui"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 transition-colors hover:text-white"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="relative z-10 mx-auto flex max-w-[800px] flex-col items-center text-center"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: "easeOut" }}>
          <img src="/favicon.svg" alt="Gear5" className="mb-8 h-[72px] w-[72px]" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-bold tracking-[-0.03em] text-white sm:text-7xl"
        >
          Gear5 UI
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-5 max-w-[520px] text-lg leading-relaxed text-neutral-400"
        >
          Design-first components for shadcn/ui. Built from real design
          decisions, not copied defaults.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_32px_rgba(6,182,212,0.3)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="https://github.com/7se7en72025/Gear5-ui"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}

const features = [
  {
    icon: Palette,
    title: "Design System First",
    description:
      "Every component starts as an actual design in Figma. Real spacing, real hierarchy, real motion choices, not guesswork.",
  },
  {
    icon: Terminal,
    title: "shadcn CLI Compatible",
    description:
      "Install components with npx shadcn add. You own the code once it hits your project. No vendor lock-in.",
  },
  {
    icon: Sparkles,
    title: "Thoughtful Motion",
    description:
      "Framer Motion animations that explain state changes and guide attention. Never added just for show.",
  },
  {
    icon: Shield,
    title: "Accessible by Default",
    description:
      "Built on Radix UI primitives with proper focus management, keyboard navigation, and ARIA support throughout.",
  },
];

function WhyGear5() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col items-center text-center"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400"
          >
            Why Gear5
          </motion.p>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-5xl"
          >
            Built different, on purpose
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-4 max-w-[480px] text-neutral-400"
          >
            Most UI kits feel the same. We started from design principles
            instead of copying the last library.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-16 grid gap-4 sm:grid-cols-2"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-5 inline-flex rounded-xl bg-cyan-500/10 p-3">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="relative z-10 mx-auto max-w-[600px] text-center"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-3 text-sm font-medium uppercase tracking-widest text-cyan-400"
        >
          Coming Soon
        </motion.p>
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-[-0.02em] text-white sm:text-5xl"
        >
          Components in progress
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-4 text-neutral-400"
        >
          The first set of core components is being designed and built right now.
          Star the repo to stay in the loop.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href="https://github.com/7se7en72025/Gear5-ui"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-neutral-300 transition-all hover:border-white/20 hover:text-white"
          >
            <Star className="h-4 w-4" />
            Star on GitHub
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-6 text-center"
        >
          {[
            { label: "Components", value: "12+" },
            { label: "Accessibility", value: "100%" },
            { label: "Bundle Size", value: "< 5kb" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="Gear5" className="h-5 w-5" />
          <span className="text-sm text-neutral-500">
            Gear5 UI &middot; MIT License
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/7se7en72025/Gear5-ui"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            GitHub
          </a>
          <span className="text-sm text-neutral-600">
            Built with{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="underline transition-colors hover:text-neutral-400"
            >
              shadcn/ui
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Hero />
      <WhyGear5 />
      <Roadmap />
      <Footer />
    </main>
  );
}