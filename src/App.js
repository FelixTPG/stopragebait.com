import React, { useMemo, useState, useEffect, useCallback } from "react";
import translations from "./translation.json";

export default function StopRagebait() {
  const supported = ["de", "en"];

  // default language
  const defaultLang = (() => {
    if (typeof navigator !== "undefined") {
      // navigator.languages ist ein Array von Prioritäten
      const langs = navigator.languages || [navigator.language || "en"];
      for (const candidate of langs) {
        if (!candidate) continue;
        const two = candidate.slice(0, 2).toLowerCase();
        if (supported.includes(two)) return two;
      }
    }
    return "en";
  })();

  // Lade gespeicherte Sprache aus localStorage oder nutze default
  const [lang, setLang] = useState(() => {
    try {
      const saved = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("sr_lang") : null;
      return saved && supported.includes(saved) ? saved : defaultLang;
    } catch {
      return defaultLang;
    }
  });

  // t ist die Übersetzungsmap für die aktuelle Sprache
  const t = useMemo(() => translations[lang] || translations["en"], [lang]);

  // Kopier-Status (für UI)
  const [copied, setCopied] = useState(false);

  // Wenn Sprache wechselt: setze HTML lang, Title & Meta Description und speichere
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${t.title} – stopragebait.com`;

    // Meta description updaten (falls vorhanden)
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", t.ogDesc || "");

    try {
      localStorage.setItem("sr_lang", lang);
    } catch {
      // ignore
    }
  }, [lang, t.title, t.ogDesc]);

  // Copy-Funktion: versucht Clipboard API, sonst Fallback
  const copy = useCallback(async () => {
    const text = typeof window !== "undefined" ? window.location.href : "";
    // try async clipboard first
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: temporäres textarea
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      // ARIA-Live wird im DOM angezeigt; setTimeout für UI-Reset
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // ignore copy errors
      console.warn("Copy failed", e);
    }
  }, []);

  return (
      <main className="min-h-screen w-full bg-gradient-to-b from-orange-100 to-amber-50 text-orange-800 dark:text-white dark:from-slate-900 dark:to-gray-900 transition-colors">
        <header className="max-w-4xl mx-auto px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden>
              💥
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">stopragebait.com</h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sr-lang-select" className="sr-only">Sprache wählen</label>
            <select
                id="sr-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="px-3 py-1 rounded-2xl border focus:outline-none focus:ring-1 focus:ring-orange-200 dark:bg-slate-700 dark:text-white"
                aria-label={lang === "de" ? "Sprache wählen" : "Choose language"}
            >
              <option value="de">🇩🇪</option>
              <option value="en">🇬🇧</option>
            </select>

            <ThemeToggle />
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">{t.tagline}</h2>
          <p className="mt-4 text-lg md:text-xl text-orange-700 dark:text-orange-200">{t.sub}</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
                onClick={copy}
                className="px-5 py-2 rounded-2xl bg-orange-900 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label={copied ? t.copied : t.cta}
            >
              {copied ? t.copied : t.cta}
            </button>

            <a
                href="#share"
                className="px-5 py-2 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {t.share}
            </a>
          </div>

          {/* ARIA-Live Region für Copy Feedback (nur für Screenreader) */}
          <div aria-live="polite" className="sr-only">
            {copied ? t.copiedAria || t.copied : ""}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6 py-4">
          <Card title={<span className="text-orange-700">{t.whyTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2 text-left">
              {t.why.map((w, i) => (
                  <li key={i}>{w}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span className="text-orange-700">{t.quickTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2">
              {t.quick.map((q, i) => (
                  <li key={i}>{q}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span className="text-orange-700">{t.dosTitle}</span>}>
            <Checklist items={t.dos} good />
          </Card>

          <Card title={<span className="text-orange-700">{t.dontsTitle}</span>}>
            <Checklist items={t.donts} />
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <h3 className="text-2xl font-semibold mb-4">{<span className="text-orange-800 dark:text-orange-200">{t.examplesTitle}</span>}</h3>
          <div className="grid gap-4">
            <Example bad={t.ex1bad} good={t.ex1good} />
            <Example bad={t.ex2bad} good={t.ex2good} />
            <Example bad={t.ex3bad} good={t.ex3good} />
          </div>
        </section>

        <section id="share" className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border p-4 bg-orange-50 dark:bg-transparent">
            <p className="text-sm">🔗 {lang === "de" ? "Gefällt dir dieser Denkzettel? Teile den Link oder nutze die Badges." : "Like this reminder? Share the link or use the badge."}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge text="stopragebait.com" />
              <Badge text="#StopRagebait" />
              <Badge text="#Wutköder" />
              <Badge text="0/10 Ragebait" />
            </div>
          </div>
        </section>

        <footer className="max-w-4xl mx-auto px-6 py-10 text-sm text-center">
          <div>{t.footerLeft} • {t.footerRight}</div>
          <div>You want to translate into your language? Open a <a href="https://github.com/FelixTPG/stopragebait.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>GitHub</a> pull request!</div>
        </footer>
      </main>
  );
}

/* --------------------------
   Hilfs-Komponenten (JSX)
   -------------------------- */

function Card({ title, children }) {
  return (
      <div className="rounded-2xl border p-5 shadow-sm bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        {children}
      </div>
  );
}

function Checklist({ items, good = false }) {
  return (
      <ul className="space-y-2">
        {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full">
                <span className={`font-bold ${good ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {good ? "✓" : "✕"}
                </span>
              </span>
              <span >{it}</span>
            </li>
        ))}
      </ul>
  );
}

function Example({ bad, good }) {
  return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 bg-red-200 dark:bg-red-900 dark:text-white">
          <div className="text-xs uppercase tracking-wide font-bold">Ragebait</div>
          <p className="mt-2 font-medium">{bad}</p>
        </div>
        <div className="rounded-2xl border p-4 bg-green-200 dark:bg-green-900 dark:text-white">
          <div className="text-xs uppercase tracking-wide font-bold">Better</div>
          <p className="mt-2 font-medium">{good}</p>
        </div>
      </div>
  );
}

function Badge({ text }) {
  return (
      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm select-none">
      <span className="h-2 w-2 rounded-full bg-orange-400" aria-hidden></span>
        {text}
    </span>
  );
}

/* ThemeToggle: verwaltet dark-class am root
   - initial prüft prefers-color-scheme
   - Benutzer kann umschalten (persistiert nicht, optional erweiterbar)
*/
function ThemeToggle() {
  const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [dark, setDark] = useState(prefersDark);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
      <button
          onClick={() => setDark(d => !d)}
          className="px-3 py-1 rounded-2xl border focus:outline-none focus:ring-1 focus:ring-orange-200"
          aria-pressed={dark}
          aria-label={dark ? "Wechsel zu hellem Theme" : "Wechsel zu dunklem Theme"}
      >
        {dark ? "🌙" : "☀️"}
      </button>
  );
}
