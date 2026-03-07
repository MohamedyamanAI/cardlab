"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-4 inset-x-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl">
      <nav className="flex h-12 items-center justify-between rounded-full border border-border/50 bg-background/50 px-4 shadow-sm shadow-black/5 backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Cardlab"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <span className="text-lg font-semibold text-foreground">
            Cardlab
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <RainbowButton size="sm" asChild className="rounded-full">
            <Link href="/auth/login">Start Building</Link>
          </RainbowButton>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden">
              <HugeiconsIcon icon={Menu01Icon} size={20} />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              <div className="my-2 border-t border-border" />
              <Button
                variant="ghost"
                className="justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/auth/login">Start Building</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
