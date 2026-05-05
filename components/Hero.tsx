"use client";

import { motion } from "motion/react";
import { Mail, ArrowDown } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/Icons";
import { urlForImage } from "@/sanity/lib/client";

interface SocialLink {
  platform: string;
  url: string;
}

interface Profile {
  name?: string;
  title?: string;
  avatar?: any;
  socialLinks?: SocialLink[];
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: GithubIcon,
  Twitter: TwitterIcon,
  X: TwitterIcon,
};

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero({ profile }: { profile: Profile | null }) {
  const name = profile?.name || "Developer";
  const title = profile?.title || "Frontend Developer";
  const socials = profile?.socialLinks || [];

  return (
    <section
      id="hero"
      className="min-h-screen snap-start flex items-center justify-center relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-start/10 blur-[120px] pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center"
      >
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Available for hire
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-8 text-5xl lg:text-7xl font-bold tracking-tight text-text-primary"
        >
          Hi, I&rsquo;m {name}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg lg:text-xl text-text-secondary max-w-xl"
        >
          {title}
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-4 mt-8">
          {socials.map((s) => {
            const Icon = socialIconMap[s.platform] || Mail;
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                className="p-2 text-text-muted hover:text-text-primary transition-colors duration-300"
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </motion.div>

        <motion.a
          variants={fadeUp}
          href="#projects"
          className="mt-12 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-start to-accent-end text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          查看我的作品
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.a>

        {/* Bottom scroll hint */}
        <motion.div
          variants={fadeUp}
          className="mt-24 w-px h-16 bg-gradient-to-b from-transparent via-text-muted to-transparent opacity-50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
