import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import PdfDropzone, { type PdfMeta } from "../ui/PdfDropzone";
import type { Job } from "./JobOffers";
import { AlexCV } from "../components/illustration/alex_cv"; // <-- IMPORT OK

function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? "/api";
  return raw.replace(/\/$/, "");
}

type ChatItem = { role: "user" | "assistant"; content: string };

type Props = {
  onJobsLoaded: (jobs: Job[]) => void;
  onOpenJobs: () => void;
};

export default function CvAnalysis({ onJobsLoaded, onOpenJobs }: Props) {
  const [pdf, setPdf] = useState<PdfMeta | null>(null);
  const [text, setText] = useState(
    "Collez ici votre CV (texte) ou saisissez une version à corriger…",
  );
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<string>("");
  const [cvContext, setCvContext] = useState<string>("");
  const [jobsKeyword, setJobsKeyword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string>("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string>("");
  const [emptyJobsHint, setEmptyJobsHint] = useState<string>("");

  useEffect(() => {
    const apiBase = getApiBase();
    const controller = new AbortController();

    async function ping() {
      try {
        const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
        setBackendOk(res.ok);
      } catch {
        setBackendOk(false);
      }
    }

    void ping();
    return () => controller.abort();
  }, []);

  async function runAnalysis() {
    if (!pdf) return;
    const apiBase = getApiBase();
    setLoading(true);
    setError("");
    setAudit("");
    setCvContext("");
    setJobsKeyword("");
    setChatHistory([]);
    setChatError("");
    setScrapeError("");
    setEmptyJobsHint("");
    setIsScraping(false);

    try {
      const form = new FormData();
      form.append("file", pdf.file, pdf.name);

      const res = await fetch(`${apiBase}/analyze`, {
        method: "POST",
        body: form,
      });

      const data = (await res.json().catch(() => null)) as
        | {
          audit_markdown?: string;
          cv_context?: string;
          jobs_keyword?: string;
          detail?: string;
        }
        | null;

      if (!res.ok) {
        const detail = data?.detail ?? `Erreur HTTP ${res.status}`;
        throw new Error(detail);
      }

      const markdown = data?.audit_markdown;
      if (!markdown) throw new Error("Réponse backend vide (audit_markdown manquant).");
      setAudit(markdown);

      const context = data?.cv_context ?? "";
      if (!context) throw new Error("Réponse backend vide (cv_context manquant).");
      setCvContext(context);

      setJobsKeyword((data?.jobs_keyword ?? "").trim());
      setChatHistory([
        {
          role: "assistant",
          content:
            "Salut ! Je suis ALEX. J'ai analysé ton profil. Tu as des questions sur mes suggestions ou tu veux qu'on travaille sur une section précise ?",
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    const message = chatDraft.trim();
    if (!message) return;
    if (!cvContext) {
      setChatError("Upload un PDF et lance l’analyse avant de chatter.");
      return;
    }

    const apiBase = getApiBase();
    setChatLoading(true);
    setChatError("");

    const nextHistory: ChatItem[] = [...chatHistory, { role: "user", content: message }];
    setChatHistory(nextHistory);
    setChatDraft("");

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: nextHistory,
          cv_context: cvContext,
          audit_context: audit,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { reply_markdown?: string; detail?: string }
        | null;

      if (!res.ok) {
        const detail = data?.detail ?? `Erreur HTTP ${res.status}`;
        throw new Error(detail);
      }

      const reply = data?.reply_markdown;
      if (!reply) throw new Error("Réponse backend vide (reply_markdown manquant).");
      setChatHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setChatLoading(false);
    }
  }

  async function startScraping() {
    if (!jobsKeyword.trim()) {
      setScrapeError("Mot-clé de recherche manquant. Relance l’analyse ou renseigne un mot-clé.");
      return;
    }
    const apiBase = getApiBase();
    setIsScraping(true);
    setScrapeError("");
    setEmptyJobsHint("");

    try {
      const res = await fetch(`${apiBase}/start-scraping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: jobsKeyword.trim() }),
      });
      const data = (await res.json().catch(() => null)) as
        | { jobs?: Job[]; detail?: string }
        | null;

      if (!res.ok) {
        const detail = data?.detail ?? `Erreur HTTP ${res.status}`;
        throw new Error(detail);
      }

      const jobs = Array.isArray(data?.jobs) ? data!.jobs! : [];
      onJobsLoaded(jobs);
      onOpenJobs();
      toast.success(
        jobs.length
          ? "Offres trouvées ! Elles ont été ajoutées à ton tableau de bord."
          : "Aucune offre trouvée pour ce mot-clé.",
      );
      if (!jobs.length) {
        setEmptyJobsHint(
          "ALEX n'a pas trouvé d'offres pour ce terme exact, essayez de modifier le mot-clé ci-dessus.",
        );
      }
    } catch (e) {
      setScrapeError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsScraping(false);
    }
  }

  const helper = useMemo(() => {
    const backend =
      backendOk === null
        ? "Backend: vérification…"
        : backendOk
          ? "Backend: connecté ✅"
          : "Backend: indisponible ❌";

    if (!pdf) return `${backend} · Déposez un PDF pour démarrer l'analyse.`;
    return `${backend} · PDF chargé : ${pdf.name} (${Math.round(pdf.size / 1024)} Ko)`;
  }, [backendOk, pdf]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">

      {/* ✅ ICI ON AJOUTE L'IMAGE ALEX */}
      <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 group">
        <div className="absolute w-72 h-72 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
        <AlexCV
          className="
      w-56 md:w-64
      drop-shadow-lg
      group-hover:drop-shadow-2xl
      group-hover:scale-105
      transition-all 
      duration-500 
      ease-out
    "
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Dépose ton CV pour commencer l'analyse
        </p>
      </div>

      <div className="mb-3">
        <h2 className="text-base font-semibold tracking-tight">Analyse CV</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{helper}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-h-[420px]">
          <PdfDropzone value={pdf} onChange={setPdf} />
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            API: <span className="font-mono">{getApiBase()}</span>
          </div>
        </div>

        <div className="min-h-[420px]">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Éditeur (corrections)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Ton bleu pro · #2563eb
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-0 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
              spellCheck
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{text.length} caractères</span>
              <button
                type="button"
                onClick={() => setText("")}
                className="rounded-lg px-2 py-1 font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Audit ALEX (Markdown)
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={!pdf || loading || backendOk === false}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                "whitespace-nowrap",
                !pdf || loading || backendOk === false
                  ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              ].join(" ")}
            >
              {loading ? "Analyse en cours…" : "Analyser"}
            </button>
          </div>
        </div>
        {error ? (
          <div className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}
        <textarea
          value={audit}
          readOnly
          placeholder="L’audit apparaîtra ici après l’analyse."
          className="h-72 w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-50"
        />

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Mot-clé de recherche
          </label>
          <input
            value={jobsKeyword}
            onChange={(e) => setJobsKeyword(e.target.value)}
            placeholder="Ex: Data Analyst, Product Manager…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
            disabled={!audit || isScraping}
          />
          {audit && jobsKeyword ? (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Suggéré par ALEX, modifiable.
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-3 z-10 mt-4 rounded-2xl bg-white/90 p-2 backdrop-blur dark:bg-slate-900/70">
          <button
            type="button"
            onClick={startScraping}
            disabled={!audit || !jobsKeyword.trim() || isScraping || backendOk === false}
            className={[
              "w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all",
              isScraping
                ? "bg-slate-700 cursor-not-allowed animate-pulse text-white"
                : "bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 text-white",
            ].join(" ")}
          >
            {isScraping ? (
              <span className="flex items-center justify-center gap-3">
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                ALEX explore le web...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span aria-hidden="true">🔍</span> Trouver des offres avec ALEX
              </span>
            )}
          </button>
        </div>
        {scrapeError ? (
          <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {scrapeError}
          </div>
        ) : null}
        {emptyJobsHint ? (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
            {emptyJobsHint}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Chat sur ton CV
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Mémoire: historique + contexte CV
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="h-56 space-y-3 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            {chatHistory.length ? (
              chatHistory.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={[
                      "inline-block max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2",
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-900 dark:bg-slate-950/60 dark:text-slate-50",
                    ].join(" ")}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 dark:text-slate-400">
                Lance d’abord l’analyse, puis pose une question (ex: “Mon titre est-il pertinent ?”).
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendChat();
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
              placeholder="Pose une question à ALEX…"
              disabled={chatLoading}
            />
            <button
              type="button"
              onClick={sendChat}
              disabled={chatLoading || !chatDraft.trim() || backendOk === false}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                "whitespace-nowrap",
                chatLoading || !chatDraft.trim() || backendOk === false
                  ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              ].join(" ")}
            >
              {chatLoading ? "Envoi…" : "Envoyer"}
            </button>
          </div>

          {chatError ? (
            <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
              {chatError}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}