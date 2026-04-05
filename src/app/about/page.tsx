import { ShieldCheck, GraduationCap, Award } from "lucide-react";
import { Navbar, Footer, Card, IconCircle } from "@/global/components";
import type { ComponentType } from "react";

const aboutCards: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  {
    icon: ShieldCheck,
    title: "Transparent Donations",
    desc: "Secure and trackable donation system ensuring transparency for educational support.",
  },
  {
    icon: GraduationCap,
    title: "Volunteer Support",
    desc: "Volunteers provide mentoring, tutoring, and academic guidance to students.",
  },
  {
    icon: Award,
    title: "Student Empowerment",
    desc: "Helping students achieve academic success and build confidence through support.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-5">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-heading text-[32px] font-light tracking-[-0.64px] mb-3">
            About CSEAS
          </h2>
          <p className="text-body max-w-[800px] mx-auto mb-12 leading-relaxed">
            CSEAS aims to reduce educational inequality by enabling community
            support through donations, volunteering, and student empowerment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="text-center">
                  <IconCircle className="mx-auto mb-4">
                    <Icon className="w-6 h-6" />
                  </IconCircle>
                  <h3 className="text-primary text-[22px] font-light tracking-[-0.22px]">
                    {card.title}
                  </h3>
                  <p className="text-body text-sm mt-2">{card.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
