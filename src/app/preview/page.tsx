import type { Metadata } from "next";

// Holding page while the API behind this app is off (ops B14/B13).
// next.config.ts sends every app route here; remove those redirects to restore the app.
export const metadata: Metadata = {
  title: "Koovis Workforce — private preview",
  description: "Koovis Workforce is in private preview. Public launch at workforce.koovis.ai coming 2026.",
  robots: { index: false },
};

export default function PreviewPage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span>koovis</span>{" "}
            <span className="text-muted-foreground font-medium">workforce</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Koovis Workforce is in private preview. Public launch at
            workforce.koovis.ai is coming in 2026.
          </p>
          <a
            href="mailto:info@koovis.ai?subject=Koovis%20Workforce%20early%20access"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request early access
          </a>
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          <a
            href="https://www.koovis.ai"
            className="font-medium text-foreground hover:underline"
          >
            Koovis AI
          </a>
        </p>
      </footer>
    </div>
  );
}
