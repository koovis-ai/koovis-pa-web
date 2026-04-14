import Link from "next/link";
import {
  Layers,
  Sparkles,
  Shield,
  Mic,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Model Intelligence",
    desc: "Claude, GPT, and Gemini behind one interface. Intelligent routing picks the right model for every query — you just ask.",
  },
  {
    icon: Sparkles,
    title: "Tools, Not Just Chat",
    desc: "Web search, file analysis, and custom tools built in. Koovis acts on your behalf, not just responds.",
  },
  {
    icon: Mic,
    title: "Voice & File Input",
    desc: "Speak or drop files — images, PDFs, documents. Everything goes into the same conversation naturally.",
  },
  {
    icon: Shield,
    title: "Private & Always On",
    desc: "Your conversations stay yours. Multi-provider failover means Koovis works even when individual providers don't.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span>koovis</span>{" "}
            <span className="text-muted-foreground font-medium">ai</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Your personal AI assistant
          </p>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground/80">
            One interface. Three frontier models. Built for the things
            you actually use AI for every day — research, writing, analysis,
            and getting things done.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Chat
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-3xl gap-4 px-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <feature.icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Built by{" "}
          <a
            href="https://www.koovis.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Koovis AI Pvt Ltd
          </a>
        </p>
      </footer>
    </div>
  );
}
