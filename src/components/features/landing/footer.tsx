"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NewTwitterIcon,
  GithubIcon,
  DiscordIcon,
} from "@hugeicons/core-free-icons";
import { Meteors } from "@/components/magicui/meteors";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Changelog", href: "#changelog" },
];

const toolLinks = [
  { label: "Design a Card Game", href: "#" },
  { label: "Create Your Own Card Game", href: "#" },
  { label: "AI Card Game Maker", href: "#" },
  { label: "Print Your Card Game", href: "#" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Affiliates / Partners", href: "#" },
  { label: "Contact", href: "#" },
];

const socialLinks = [
  { icon: NewTwitterIcon, href: "#", label: "Twitter" },
  { icon: GithubIcon, href: "#", label: "GitHub" },
  { icon: DiscordIcon, href: "#", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="relative mx-auto mb-6 max-w-6xl overflow-hidden rounded-3xl bg-neutral-950 px-2 text-neutral-300 sm:px-4">
      <Meteors number={14} className="opacity-70" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Cardlab"
                width={24}
                height={24}
                className="h-6 w-6 shrink-0"
              />
              <span className="text-lg font-semibold text-white">Cardlab</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              The all-in-one platform for designing, prototyping, and publishing
              tabletop card games.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-neutral-400 transition-colors hover:text-white"
                  aria-label={social.label}
                >
                  <HugeiconsIcon icon={social.icon} size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Tools</h3>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 sm:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; 2026 Cardlab. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-neutral-500 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-neutral-500 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
