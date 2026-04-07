import { Suspense } from "react";
import { Navbar, Footer } from "@/global/components";
import { OtpVerifyForm } from "@/features/auth";

export default function VerifyOtpPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <Suspense fallback={null}>
          <OtpVerifyForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
