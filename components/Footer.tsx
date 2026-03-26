"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  exact?: boolean;
}

interface NavGroup {
  group: string;
  accent: string;
  items: NavItem[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const links: NavGroup[] = [
  {
    group: "Product",
    accent: "#FF6B35",
    items: [
      { title: "Explore", href: "/", exact: true },
      { title: "Trips", href: "/trips" },
      { title: "Transport", href: "/transport" },
      { title: "Most Rating", href: "/most-rating" },
    ],
  },
  {
    group: "Platform",
    accent: "#845EF7",
    items: [
      { title: "About", href: "#" },
      { title: "Partner", href: "/become-provider" },
      { title: "Careers", href: "#" },
      { title: "Contact", href: "#" },
      { title: "Help", href: "#" },
    ],
  },
  {
    group: "Legal",
    accent: "#00C9A7",
    items: [
      { title: "Licence", href: "#" },
      { title: "Privacy", href: "#" },
      { title: "Cookies", href: "#" },
      { title: "Security", href: "#" },
    ],
  },
];

const socials: SocialLink[] = [
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
        />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
        />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
        />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19.25 8.505c-1.577-5.867-7-5.5-7-5.5s-7.5-.5-7.5 8.995s7.5 8.996 7.5 8.996s4.458.296 6.5-3.918c.667-1.858.5-5.573-6-5.573c0 0-3 0-3 2.5c0 .976 1 2 2.5 2s3.171-1.027 3.5-3c1-6-4.5-6.5-6-4"
          color="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
        />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const path = usePathname();

  const currentYear = new Date().getFullYear();
  const current = path === "/unauthorized";

  if (current) return null;

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden border-t bg-waylink-fade border-[#e8e4de] dark:border-[#2a2930] transition-colors duration-500 font-sans"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #845EF7 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern
              id="footer-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="relative z-10 mian-container pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-14 md:grid-cols-5 mb-14"
        >
          <div className="md:col-span-2 flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center space-x-2 z-50 shrink-0 select-none"
            >
              <Image
                src="/icons/waylink.svg"
                alt="waylink"
                width={40}
                height={40}
                priority
              />
              <span className="font-bold text-xl">
                <span className="text-orange-2">Way</span>
                <span className="text-blue-10">Link</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs text-[#6b6560] dark:text-[#9b9690]">
              Discover extraordinary experiences and seamless transport — all in
              one place, built around you.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.25,
                  }}
                  whileHover={{
                    scale: 1.05,
                    color: "#FF6B35",
                  }}
                  whileTap={{ scale: 0.92 }}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center text-[#6b6560] dark:text-[#6a6870] bg-white/60 dark:bg-[#16161e]/60 border-[#e8e4de] dark:border-[#2a2930] backdrop-blur-sm transition-colors duration-200"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            {links.map((group, gi) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + gi * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: group.accent }}
                  />
                  <span
                    className="text-xs font-bold tracking-[0.18em] uppercase"
                    style={{ color: group.accent }}
                  >
                    {group.group}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ x: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#e8e4de]/50 dark:hover:bg-[#2a2930]/50 font-medium transition-colors duration-150 group"
                      >
                        <motion.span
                          className="w-1 h-1 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: group.accent }}
                          initial={false}
                        />
                        {item.title}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Separator />

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
        >
          <span className="text-xs text-muted-foreground order-last sm:order-first">
            © {currentYear} WayLink. All rights reserved.
          </span>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Built for explorers</span>
            <span className="text-sm" style={{ color: "#FF6B35" }}>
              ✦
            </span>
            <span>by the WayLink team</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
