import LoadingScreen from "@/components/LoadingScreen";
import CursorGlow from "@/components/CursorGlow";
import ScrollIndicator from "@/components/ScrollIndicator";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <CursorGlow />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E)",
        }}
      />

      <ScrollIndicator />

      <main className="relative z-10 h-screen overflow-y-auto snap-y snap-mandatory">
        <Hero />
        <Projects />
        <Blog />
        <Footer />
      </main>
    </>
  );
}
