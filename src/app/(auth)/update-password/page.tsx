import { Navbar, Footer } from "@/global/components";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <UpdatePasswordForm />
      </main>
      <Footer />
    </>
  );
}
