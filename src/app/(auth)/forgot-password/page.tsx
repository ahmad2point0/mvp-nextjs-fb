import { Navbar, Footer } from "@/global/components";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <ForgotPasswordForm />
      </main>
      <Footer />
    </>
  );
}
