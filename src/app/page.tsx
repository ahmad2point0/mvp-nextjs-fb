"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type ComponentType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePublicStats } from "@/features/home";
import {
  DollarSign,
  GraduationCap,
  Award,
  BookOpen,
  Package,
  FileText,
  BookMarked,
  Shirt,
  UtensilsCrossed,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Navbar, Footer, Card, IconCircle } from "@/global/components";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */

const modules: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  { icon: DollarSign, title: "Donation Management", desc: "Donors can provide financial and material support." },
  { icon: GraduationCap, title: "Volunteer Management", desc: "Volunteers help students through tutoring." },
  { icon: Award, title: "Education Aid", desc: "Students can request educational support." },
];

const volunteerJobs: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  { icon: BookOpen, title: "Math Tutor", desc: "Help students improve mathematics skills." },
  { icon: Package, title: "Donation Distributor", desc: "Deliver donated materials to students." },
  { icon: FileText, title: "Report Assistant", desc: "Prepare student progress reports." },
];

const donationNeeds: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  { icon: BookMarked, title: "Books Needed", desc: "Students need textbooks and notebooks." },
  { icon: Shirt, title: "School Uniforms", desc: "Uniform support required for students." },
  { icon: UtensilsCrossed, title: "Food Support", desc: "Food packages required for families." },
];

const aboutCards: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  { icon: ShieldCheck, title: "Transparent Donations", desc: "Secure and trackable donation system ensuring full transparency." },
  { icon: GraduationCap, title: "Volunteer Support", desc: "Volunteers provide mentoring, tutoring, and academic guidance." },
  { icon: Award, title: "Student Empowerment", desc: "Helping students achieve academic success through support." },
];

const howItWorks = [
  { step: "01", title: "Create Account", desc: "Register as a donor, volunteer, or student in seconds." },
  { step: "02", title: "Get Matched", desc: "Our system connects donors with students and assigns volunteers." },
  { step: "03", title: "Make an Impact", desc: "Donate, mentor, or receive aid — all tracked transparently." },
  { step: "04", title: "Track Progress", desc: "View reports, task updates, and donation receipts in real-time." },
];

const testimonials = [
  {
    name: "Fatima Ali",
    role: "Student",
    quote: "CSEAS helped me get the books and stationery I needed to continue my education. I'm grateful to the donors who supported me.",
  },
  {
    name: "Ahmed Raza",
    role: "Donor",
    quote: "The transparency of the platform gives me confidence that my donations are reaching the right students. A wonderful initiative.",
  },
  {
    name: "Sara Malik",
    role: "Volunteer",
    quote: "Tutoring students through CSEAS has been one of the most rewarding experiences. The platform makes coordination effortless.",
  },
];

const faqs = [
  {
    q: "How do I register as a donor?",
    a: "Click 'Get Started', select the Donor role, fill in your details, and you'll be ready to make your first donation within minutes.",
  },
  {
    q: "Is my donation secure and trackable?",
    a: "Yes. Every donation is recorded with a transaction ID and can be tracked through your dashboard. We support JazzCash, Easypaisa, and cash donations.",
  },
  {
    q: "How are students verified?",
    a: "Students are verified by our admin team before they can request aid. Each application goes through an approval process to ensure legitimacy.",
  },
  {
    q: "Can I volunteer remotely?",
    a: "Absolutely. Many volunteer tasks like tutoring and report preparation can be done remotely. On-site tasks like distribution are also available.",
  },
  {
    q: "Who manages the platform?",
    a: "CSEAS is managed by a dedicated admin panel where system administrators review users, approve requests, and generate reports.",
  },
];

/* Format large currency amounts for compact display.
   1,250,000 → { value: 1250, suffix: "K+" }
   2,500,000 → { value: 2, suffix: "M+" }
   850       → { value: 850,  suffix: "+"  } */
function formatCurrencyStat(amount: number): { value: number; suffix: string } {
  if (amount >= 1_000_000) {
    return { value: Math.floor(amount / 1_000_000), suffix: "M+" };
  }
  if (amount >= 1_000) {
    return { value: Math.floor(amount / 1_000), suffix: "K+" };
  }
  return { value: amount, suffix: "+" };
}

/* ─── Icon Card Helper ─── */

function IconCard({
  icon: Icon,
  title,
  desc,
  dark = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  dark?: boolean;
}) {
  return dark ? (
    <div className="anim-card bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-lg p-7 text-center group hover:bg-white/[0.1] hover:-translate-y-1 transition-all duration-300">
      <IconCircle className="mx-auto mb-5 !bg-white/10 !text-white group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </IconCircle>
      <h3 className="text-white text-lg font-light tracking-tight">
        {title}
      </h3>
      <p className="text-white/50 text-sm mt-2 leading-relaxed">{desc}</p>
    </div>
  ) : (
    <Card className="anim-card text-center group hover:-translate-y-1 transition-transform duration-300">
      <IconCircle className="mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </IconCircle>
      <h3 className="text-primary text-lg font-light tracking-tight">
        {title}
      </h3>
      <p className="text-body text-sm mt-2 leading-relaxed">{desc}</p>
    </Card>
  );
}

/* ─── Page ─── */

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { data: stats } = usePublicStats();

  const impactStats = useMemo(() => {
    const donations = formatCurrencyStat(stats?.totalDonations ?? 0);
    return [
      { value: donations.value, suffix: donations.suffix, label: "Donations (Rs)" },
      { value: stats?.studentsSupported ?? 0, suffix: "+", label: "Students Supported" },
      { value: stats?.activeVolunteers ?? 0, suffix: "+", label: "Active Volunteers" },
      { value: stats?.tasksCompleted ?? 0, suffix: "+", label: "Tasks Completed" },
    ];
  }, [stats]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Hero entrance timeline ── */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .from(".hero-orb-1", { scale: 0, opacity: 0, duration: 1.4 })
        .from(".hero-orb-2", { scale: 0, opacity: 0, duration: 1.4 }, 0.2)
        .from(".hero-orb-3", { scale: 0, opacity: 0, duration: 1.2 }, 0.4)
        .from(".hero-heading", { y: 60, opacity: 0, duration: 1 }, 0.3)
        .from(".hero-sub", { y: 40, opacity: 0, duration: 0.8 }, 0.6)
        .from(".hero-cta", { y: 30, opacity: 0, duration: 0.7 }, 0.8)
        .from(".hero-badge", { y: 20, opacity: 0, duration: 0.6 }, 1.0);

      /* Floating orbs parallax */
      gsap.to(".hero-orb-1", {
        y: -40,
        x: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-orb-2", {
        y: 30,
        x: -15,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".hero-orb-3", {
        y: -25,
        x: -10,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      /* ── Section headings ── */
      gsap.utils.toArray<HTMLElement>(".section-heading").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      });

      /* ── Section subtitles ── */
      gsap.utils.toArray<HTMLElement>(".section-sub").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          delay: 0.15,
          ease: "power2.out",
        });
      });

      /* ── Card grids ── */
      gsap.utils.toArray<HTMLElement>(".card-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".anim-card");
        gsap.from(cards, {
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          y: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
        });
      });

      /* ── Dark section parallax ── */
      gsap.utils.toArray<HTMLElement>(".parallax-bg").forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el.parentElement!,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
          y: -60,
          ease: "none",
        });
      });

      /* ── Divider line grow ── */
      gsap.utils.toArray<HTMLElement>(".divider-line").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          scaleX: 0,
          duration: 1,
          ease: "power2.inOut",
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  /* ── Impact counter ── runs once stats are loaded so the
     animation targets the real values from /api/public/stats. */
  useEffect(() => {
    if (!stats) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.value || "0", 10);
        gsap.killTweensOf(el);
        el.textContent = "0";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString();
          },
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, [stats]);

  return (
    <div ref={mainRef}>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-brand-dark overflow-hidden">
        {/* Gradient orbs */}
        <div className="hero-orb-1 absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="hero-orb-2 absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-magenta/15 blur-[100px]" />
        <div className="hero-orb-3 absolute top-[50%] left-[60%] w-[250px] h-[250px] rounded-full bg-ruby/10 blur-[80px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative text-center text-white max-w-[900px] px-6 py-20">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 text-xs text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Empowering 75+ students across communities
          </div>

          <h1 className="hero-heading text-5xl md:text-[64px] font-light leading-[1.05] tracking-[-1.6px]">
            Empowering Education,
            <br />
            <span className="bg-gradient-to-r from-primary-light via-primary to-magenta bg-clip-text text-transparent">
              Building Communities
            </span>
          </h1>

          <p className="hero-sub mt-6 text-lg font-light text-white/50 max-w-[560px] mx-auto leading-relaxed">
            CSEAS connects donors, volunteers, and underprivileged students
            through a transparent platform for educational support.
          </p>

          <div className="hero-cta flex items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="inline-flex items-center px-7 py-3 bg-primary text-white rounded font-normal text-sm hover:bg-primary-hover transition-all hover:shadow-[0_0_30px_rgba(83,58,253,0.4)]"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-7 py-3 rounded font-normal text-sm text-white/70 border border-white/10 hover:border-white/25 hover:text-white transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      </section>

      {/* IMPACT STATS */}
      <section className="py-16 px-5 -mt-12 relative z-10">
        <div className="card-grid grid grid-cols-2 md:grid-cols-4 gap-5 max-w-[900px] mx-auto">
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className="anim-card bg-white rounded-lg p-6 text-center shadow-elevated border border-border"
            >
              <p className="text-heading text-3xl font-light tracking-tight">
                <span className="stat-number" data-value={stat.value}>
                  0
                </span>
                <span className="text-primary">{stat.suffix}</span>
              </p>
              <p className="text-body text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM MODULES */}
      <section className="py-20 px-5">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          System Modules
        </h2>
        <p className="section-sub text-center text-body text-sm mt-2 mb-12 max-w-[500px] mx-auto">
          Three core pillars powering the CSEAS ecosystem.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1000px] mx-auto">
          {modules.map((item) => (
            <IconCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-5 bg-[#f9fafb]">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          How It Works
        </h2>
        <p className="section-sub text-center text-body text-sm mt-2 mb-12 max-w-[500px] mx-auto">
          Four simple steps to start making a difference.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 max-w-[1000px] mx-auto">
          {howItWorks.map((item) => (
            <div
              key={item.step}
              className="anim-card text-center group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-xl font-light mx-auto mb-4 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {item.step}
              </div>
              <h3 className="text-heading text-base font-normal tracking-tight">
                {item.title}
              </h3>
              <p className="text-body text-sm mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VOLUNTEER JOBS (dark) */}
      <section className="relative py-24 px-5 overflow-hidden">
        <div className="parallax-bg absolute inset-0 bg-brand-dark" />
        {/* Decorative orb */}
        <div className="absolute top-[20%] right-[5%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative">
          <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-white">
            Volunteer Jobs Offered
          </h2>
          <p className="section-sub text-center text-white/40 text-sm mt-2 mb-12 max-w-[500px] mx-auto">
            Make a difference by contributing your skills and time.
          </p>
          <div className="divider-line w-12 h-[2px] bg-primary-light mx-auto mb-12 origin-left" />
          <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1000px] mx-auto">
            {volunteerJobs.map((item) => (
              <IconCard key={item.title} {...item} dark />
            ))}
          </div>
        </div>
      </section>

      {/* DONATION NEEDS */}
      <section className="py-20 px-5">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          Donation Needs
        </h2>
        <p className="section-sub text-center text-body text-sm mt-2 mb-12 max-w-[500px] mx-auto">
          Help students by donating what they need the most.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1000px] mx-auto">
          {donationNeeds.map((item) => (
            <IconCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-5 bg-[#f9fafb]">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          What People Say
        </h2>
        <p className="section-sub text-center text-body text-sm mt-2 mb-12 max-w-[500px] mx-auto">
          Hear from donors, volunteers, and students who use CSEAS.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1000px] mx-auto">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="anim-card group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-primary text-3xl leading-none mb-3">&ldquo;</div>
              <p className="text-body text-sm leading-relaxed italic">
                {t.quote}
              </p>
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-heading text-sm font-normal">{t.name}</p>
                <p className="text-primary text-xs">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-5">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          Frequently Asked Questions
        </h2>
        <p className="section-sub text-center text-body text-sm mt-2 mb-12 max-w-[500px] mx-auto">
          Everything you need to know about CSEAS.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid max-w-[700px] mx-auto flex flex-col gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="anim-card group bg-white border border-border rounded-lg shadow-ambient overflow-hidden"
            >
              <summary className="cursor-pointer px-6 py-4 text-heading text-sm font-normal flex items-center justify-between list-none">
                {faq.q}
                <span className="text-primary ml-4 shrink-0 transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <div className="px-6 pb-4 text-body text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative py-20 px-5 overflow-hidden">
        <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-brand-dark" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative text-center max-w-[600px] mx-auto">
          <h2 className="section-heading text-[32px] font-light tracking-[-0.64px] text-white">
            Ready to Make a Difference?
          </h2>
          <p className="section-sub text-white/50 text-sm mt-3 mb-8">
            Join CSEAS today and help empower education in underserved communities.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center px-7 py-3 bg-white text-primary rounded font-normal text-sm hover:bg-white/90 transition-all shadow-elevated"
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3 rounded font-normal text-sm text-white/70 border border-white/20 hover:border-white/40 hover:text-white transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT CSEAS */}
      <section className="py-20 px-5">
        <h2 className="section-heading text-center text-[32px] font-light tracking-[-0.64px] text-heading">
          About CSEAS
        </h2>
        <p className="section-sub text-center max-w-[700px] mx-auto text-body text-sm mt-2 mb-12">
          CSEAS aims to reduce educational inequality by enabling community
          support through donations, volunteering, and student empowerment.
        </p>
        <div className="divider-line w-12 h-[2px] bg-primary mx-auto mb-12 origin-left" />
        <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1000px] mx-auto">
          {aboutCards.map((item) => (
            <IconCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
