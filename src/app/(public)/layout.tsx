import { Navbar } from "@/components/features/landing/navbar";
import { Footer } from "@/components/features/landing/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
