"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.svg"
            alt="CSEAS"
            width={36}
            height={36}
            priority
            className="shrink-0"
          />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-heading text-[15px] font-medium tracking-tight truncate">
              Community Support &amp; Education Aid System
            </span>
            <span className="text-body text-[10px] uppercase tracking-[0.18em] hidden sm:block">
              CSEAS Platform
            </span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
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

        <div className="hidden lg:flex items-center gap-3">
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

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-heading hover:text-primary transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[300px] border-t border-border" : "max-h-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-3">
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
          <hr className="border-border" />
          <Link
            href="/login"
            className="text-sm font-normal text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-normal text-white bg-primary hover:bg-primary-hover rounded transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
