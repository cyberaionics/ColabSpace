import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Colabspace</h1>
          <p className="text-muted-foreground">IIT Dharwad Project Collaboration Platform</p>
          <p className="text-sm text-muted-foreground mt-2">Phase 1 Foundation - Ready</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
