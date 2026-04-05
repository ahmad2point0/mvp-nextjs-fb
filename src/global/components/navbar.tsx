"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-[1080px] flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-heading font-light text-lg tracking-tight">
          CSEAS
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-normal transition-colors ${
                pathname === link.href
                  ? "text-primary"
                  : "text-heading hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-normal text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center px-4 py-2 text-sm font-normal text-white bg-primary hover:bg-primary-hover rounded transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
