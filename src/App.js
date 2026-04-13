import React, { useMemo, useState, useEffect, useCallback } from "react";
import translations from "./translation.json";

export default function StopRagebait() {
  const supported = Object.keys(translations);

  // default language
  const defaultLang = (() => {
    if (typeof navigator !== "undefined") {
      // priority to browser language
      const langs = navigator.languages || [navigator.language || "en"];
      for (const candidate of langs) {
        if (!candidate) continue;
        const two = candidate.slice(0, 2).toLowerCase();
        if (supported.includes(two)) return two;
      }
    }
    return "en";
  })();

  // load saved language from localStorage or use default
  const [lang, setLang] = useState(() => {
    try {
      const saved = typeof window !== "undefined" && window.localStorage ? localStorage.getItem("sr_lang") : null;
      return saved && supported.includes(saved) ? saved : defaultLang;
    } catch {
      return defaultLang;
    }
  });

  // t = translations for current language
  const t = useMemo(() => ({ ...translations[lang] }) || { ...translations["en"] }, [lang]);

  // ui copy status
  const [copied, setCopied] = useState(false);

  // when language changes, update document lang and localStorage
  useEffect(() => {
    document.documentElement.lang = lang;

    try {
      localStorage.setItem("sr_lang", lang);
    } catch {
      // ignore
    }
  }, [lang, t.title]);

  // link copy - try async clipboard first, fallback to textarea
  const copy = useCallback(async () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // async
        await navigator.clipboard.writeText(baseUrl);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = baseUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      // aria-live feedback
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // ignore copy errors
      console.warn("Copy failed", e);
    }
  }, []);

  return (
      <main className="min-h-screen w-full bg-gradient-to-b from-orange-100 to-amber-50 text-orange-900 dark:text-white dark:from-slate-950 dark:to-slate-900  transition-colors">
        <header className="max-w-4xl mx-auto px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden>
              💥
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">stopragebait.com</h1>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sr-lang-select" className="sr-only">Select language</label>
            <select
                id="sr-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="px-3 py-1 rounded-2xl border border-slate-400 focus:outline-none dark:bg-slate-700 dark:text-white cursor-pointer"
                aria-label="Choose language"
            >
              {supported.map((code) => (
                <option key={code} value={code}>{translations[code].flag}</option>
              ))}
            </select>

            <ThemeToggle />
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">{t.tagline}</h2>
          <p className="mt-4 text-lg md:text-xl text-orange-900 dark:text-white">{t.sub}</p>

          <div className="mt-6 flex justify-left gap-3">
            <button
                onClick={copy}
                className="px-5 py-2 rounded-2xl bg-orange-800 dark:bg-slate-400 dark:text-black text-white hover:opacity-90 focus:outline-none"
                aria-label={copied ? t.copied : t.cta}
            >
              {copied ? t.copied : t.cta}
            </button>
          </div>

          {/* aria-live region for dom */}
          <div aria-live="polite" className="sr-only">
            {copied ? t.copiedAria || t.copied : ""}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6 py-4">
          <Card title={<span className="">{t.whyTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2 text-left">
              {t.why.map((w, i) => (
                  <li key={i}>{w}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span className="">{t.quickTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2">
              {t.quick.map((q, i) => (
                  <li key={i}>{q}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span className="">{t.dosTitle}</span>}>
            <Checklist items={t.dos} good />
          </Card>

          <Card title={<span className="">{t.dontsTitle}</span>}>
            <Checklist items={t.donts} />
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <h3 className="text-2xl font-semibold mb-4">{t.examplesTitle}</h3>
          <div className="grid gap-4">
            <Example bad={t.ex1bad} good={t.ex1good} t={t} />
            <Example bad={t.ex2bad} good={t.ex2good} t={t} />
            <Example bad={t.ex3bad} good={t.ex3good} t={t} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <h3 className="text-2xl font-semibold mb-4">{t.ragebaitGuide.title}</h3>
          <Card>
            <p className="mb-3 tracking-wide">{t.ragebaitGuide.description}</p>
            <ul className="list-item pl-5 space-y-2">
              {t.ragebaitGuide.li.map((item, i) => {
                const emojis = ["🚫", "🧠", "🔍", "⚔️", "🚨", "🧘"];
                return (
                    <li key={i} dangerouslySetInnerHTML={{ __html: `${emojis[i]} ${item.replace(/\*(.*?)\*/g, "<strong>$1</strong>")}` }} />
                );
              })}
            </ul>
          </Card>
        </section>

        <section id="share" className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border p-4 bg-orange-50 dark:bg-transparent">
            <p className="text-sm">🔗 {t.share}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge text="stopragebait.com" />
              <Badge text="#StopRagebait" />
              <Badge text="#Wutköder" />
              <Badge text="0/10 Ragebait" />
            </div>
          </div>
        </section>

        <footer className="max-w-4xl mx-auto px-6 py-10 md:border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:justify-between gap 4">
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.footerLeft}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.footerRight}</div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">You want to translate into your language? Open a <a href="https://github.com/FelixTPG/stopragebait.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>GitHub</a> pull request!</div>
        </footer>
      </main>
  );
}

/* --------------------------
   jsx components
   -------------------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
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

function Example({ bad, good, t }: { bad: string; good: string, t: any }) {
  return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 p-4 bg-rose-50/60 dark:bg-rose-950/20">
          <div className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-300">{t.bad}</div>
          <p className="mt-2 text-rose-900 dark:text-rose-200 font-medium">{bad}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 p-4 bg-emerald-50/60 dark:bg-emerald-950/20">
          <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{t.good}</div>
          <p className="mt-2 text-emerald-900 dark:text-emerald-200 font-medium">{good}</p>
        </div>
      </div>
  );
}

function Badge({ text }) {
  return (
      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm select-none">
      <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden></span>
        {text}
    </span>
  );
}

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
          className="px-3 py-1 rounded-2xl border border-slate-400 focus:outline-none cursor-pointer"
          aria-pressed={dark}
          aria-label="Change the white/dark theme of the website"
      >
        {dark ? "🌙" : "☀️"}
      </button>
  );
}
