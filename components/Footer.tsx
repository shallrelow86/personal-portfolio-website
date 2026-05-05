"use client";

import { Mail } from "lucide-react";
import { GithubIcon, TwitterIcon } from "@/components/Icons";

const socials = [
  { icon: GithubIcon, href: "https://github.com", label: "GitHub" },
  { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 text-center">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-center gap-4 mb-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="p-2 text-text-muted hover:text-text-primary transition-colors duration-300"
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <p className="text-sm text-text-muted">
          Designed &amp; Built by Developer &middot; &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
