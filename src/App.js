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
      <main className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50 text-slate-800 dark:text-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 selection:bg-orange-200 dark:selection:bg-orange-900/50">
        <header className="max-w-4xl mx-auto px-6 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl drop-shadow-sm" aria-hidden>
              💥
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">stopragebait.com</h1>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sr-lang-select" className="sr-only">Select language</label>
            <select
                id="sr-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-sm transition-all cursor-pointer text-sm font-medium hover:bg-white dark:hover:bg-slate-800 appearance-none"
                aria-label="Choose language"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
            >
              {supported.map((code) => (
                  <option key={code} value={code}>{translations[code].flag}</option>
              ))}
            </select>

            <ThemeToggle />
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-10 md:py-16">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            {t.tagline}
          </h2>
          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {t.sub}
          </p>

          <div className="mt-8 flex justify-left gap-3">
            <button
                onClick={copy}
                className="px-6 py-3 rounded-2xl font-semibold bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-xl hover:-translate-y-0.5 dark:bg-orange-500 dark:hover:bg-orange-400 dark:text-slate-950 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                aria-label={copied ? t.copied : t.cta}
            >
              {copied ? `✓ ${t.copied}` : t.cta}
            </button>
          </div>

          {/* aria-live region for dom */}
          <div aria-live="polite" className="sr-only">
            {copied ? t.copiedAria || t.copied : ""}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6 py-6">
          <Card title={<span className="text-orange-600 dark:text-orange-400">{t.whyTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2.5 text-left text-slate-700 dark:text-slate-300 marker:text-orange-400 dark:marker:text-orange-500/70">
              {t.why.map((w, i) => (
                  <li key={i}>{w}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span className="text-orange-600 dark:text-orange-400">{t.quickTitle}</span>}>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-700 dark:text-slate-300 marker:text-orange-400 dark:marker:text-orange-500/70">
              {t.quick.map((q, i) => (
                  <li key={i}>{q}</li>
              ))}
            </ul>
          </Card>

          <Card title={<span>{t.dosTitle}</span>}>
            <Checklist items={t.dos} good />
          </Card>

          <Card title={<span>{t.dontsTitle}</span>}>
            <Checklist items={t.donts} />
          </Card>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-8">
          <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.examplesTitle}</h3>
          <div className="grid gap-5">
            <Example bad={t.ex1bad} good={t.ex1good} t={t} />
            <Example bad={t.ex2bad} good={t.ex2good} t={t} />
            <Example bad={t.ex3bad} good={t.ex3good} t={t} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-8">
          <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.ragebaitGuide.title}</h3>
          <Card className="!p-8">
            <p className="mb-6 text-lg font-medium text-slate-800 dark:text-slate-200">{t.ragebaitGuide.description}</p>
            <ul className="space-y-4">
              {t.ragebaitGuide.li.map((item, i) => {
                const emojis = ["🚫", "🧠", "🔍", "⚔️", "🚨", "🧘"];
                return (
                    <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                      <span className="text-xl shrink-0 mt-0.5">{emojis[i]}</span>
                      <span dangerouslySetInnerHTML={{ __html: item.replace(/\*(.*?)\*/g, "<strong class='text-slate-900 dark:text-white'>$1</strong>") }} />
                    </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <section id="share" className="max-w-4xl mx-auto px-6 py-8">
          <div className="rounded-3xl border border-orange-200/50 dark:border-slate-800 p-6 bg-orange-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">🔗 {t.share}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge text="stopragebait.com" />
              <Badge text="#StopRagebait" />
              <Badge text="#Wutköder" />
              <Badge text="0/10 Ragebait" />
            </div>
          </div>
        </section>

        <footer className="max-w-4xl mx-auto px-6 py-12 mt-8 md:border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 mb-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">{t.footerLeft}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{t.footerRight}</div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            You want to translate into your language? Open a <a href="https://github.com/FelixTPG/stopragebait.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline font-medium transition-colors">GitHub</a> pull request!
          </div>
        </footer>
      </main>
  );
}

/* --------------------------
   jsx components
   -------------------------- */

function Card({ title, children, className = "" }) {
  return (
      <div className={`rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-xl shadow-slate-200/40 bg-white/60 dark:bg-slate-800/60 dark:shadow-none backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 ${className}`}>
        {title && <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{title}</h3>}
        {children}
      </div>
  );
}

function Checklist({ items, good = false }) {
  return (
      <ul className="space-y-3">
        {items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
              <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${good ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"}`}>
                {good ? "✓" : "✕"}
              </span>
              <span className="leading-relaxed">{it}</span>
            </li>
        ))}
      </ul>
  );
}

function Example({ bad, good, t }) {
  return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-rose-200/60 dark:border-rose-900/40 p-5 bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            {t.bad}
          </div>
          <p className="text-rose-950 dark:text-rose-100 font-medium leading-relaxed">{bad}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 p-5 bg-emerald-50/80 dark:bg-emerald-950/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            {t.good}
          </div>
          <p className="text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">{good}</p>
        </div>
      </div>
  );
}

function Badge({ text }) {
  return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-800/80 px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-sm select-none transition-colors hover:bg-white dark:hover:bg-slate-700">
        <span className="h-2 w-2 rounded-full bg-orange-400 dark:bg-orange-500" aria-hidden></span>
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
          className="p-2 rounded-xl border border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-sm transition-all cursor-pointer shadow-sm text-lg"
          aria-pressed={dark}
          aria-label="Change the white/dark theme of the website"
      >
        {dark ? "🌙" : "☀️"}
      </button>
  );
}