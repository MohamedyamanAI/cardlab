"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Sidebar,
  SidebarBody,
  useSidebar,
} from "@/components/aceternity/sidebar";
import { cn } from "@/lib/utils/utils";
import {
  IconBrush,
  IconBulb,
  IconCards,
  IconFileText,
  IconFolders,
  IconPackage,
  IconTestPipe,
} from "@tabler/icons-react";

const navLinks = [
  {
    label: "Projects",
    href: "/projects",
    icon: <IconFolders className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Docs",
    href: "/docs",
    icon: <IconFileText className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Ideator",
    href: "/ideator",
    icon: <IconBulb className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Cards",
    href: "/cards",
    icon: <IconCards className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Generator",
    href: "/generator",
    icon: <IconBrush className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Tester",
    href: "/tester",
    icon: <IconTestPipe className="h-5 w-5 shrink-0" />,
  },
  {
    label: "Print & Ship",
    href: "/print-ship",
    icon: <IconPackage className="h-5 w-5 shrink-0" />,
  },
];

function SidebarNav() {
  const { open, animate } = useSidebar();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors group/sidebar",
              isActive
                ? "bg-primary/10 text-primary dark:bg-primary/20"
                : "text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-700/60"
            )}
          >
            {link.icon}
            <motion.span
              animate={{
                display: animate
                  ? open
                    ? "inline-block"
                    : "none"
                  : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="whitespace-pre transition duration-150 group-hover/sidebar:translate-x-1"
            >
              {link.label}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarUser({ email }: { email: string }) {
  const { open, animate } = useSidebar();

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary uppercase">
        {email[0]}
      </div>
      <motion.div
        animate={{
          display: animate
            ? open
              ? "inline-block"
              : "none"
            : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="overflow-hidden whitespace-pre"
      >
        <p className="truncate text-sm text-neutral-700 dark:text-neutral-200">
          {email}
        </p>
      </motion.div>
    </div>
  );
}

export function AppSidebar({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background p-2">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between rounded-2xl bg-neutral-50 px-2 dark:bg-neutral-900">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-6">
              <SidebarNav />
            </div>
          </div>
          <SidebarUser email={userEmail} />
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function Logo() {
  const { open, animate } = useSidebar();

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <Image
        src="/images/logo.png"
        alt="Cardlab"
        width={24}
        height={24}
        className="h-6 w-6 shrink-0"
      />
      <motion.span
        animate={{
          display: animate
            ? open
              ? "inline-block"
              : "none"
            : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="whitespace-pre text-lg font-semibold text-foreground"
      >
        Cardlab
      </motion.span>
    </div>
  );
}
