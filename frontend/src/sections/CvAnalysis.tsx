import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PdfDropzone, { type PdfMeta } from "../ui/PdfDropzone";
import type { Job } from "./JobOffers";
import { AlexCV } from "../components/illustration/alex_cv";

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
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<string>("");
  const [cvContext, setCvContext] = useState<string>("");
  const [jobsKeyword, setJobsKeyword] = useState<string>("");
  
  // ✅ Nouveaux filtres dynamiques
  const [location, setLocation] = useState("France");
  const [contractType, setContractType] = useState("");

  const [error, setError] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    const apiBase = getApiBase();
    async function ping() {
      try {
        const res = await fetch(`${apiBase}/health`);
        setBackendOk(res.ok);
      } catch {
        setBackendOk(false);
      }
    }
    void ping();
  }, []);

  useEffect(() => {
    if (pdf && !loading && audit === "") {
      void runAnalysis();
    }
  }, [pdf]);

  async function runAnalysis() {
    if (!pdf) return;
    const apiBase = getApiBase();
    setLoading(true);
    setError("");
    setAudit("");

    try {
      const form = new FormData();
      form.append("file", pdf.file, pdf.name);
      const res = await fetch(`${apiBase}/analyze`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail ?? "Erreur d'analyse");

      setAudit(data?.audit_text || data?.audit_markdown || "");
      setCvContext(data?.cv_context || "");
      setJobsKeyword((data?.jobs_keyword || "").trim());
      
      setChatHistory([{ role: "assistant", content: "Salut ! J'ai fini l'analyse. Des questions ?" }]);
      toast.success("Analyse terminée !");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  // ✅ SCRAPING AVEC FILTRES DYNAMIQUES
  async function startScraping() {
    if (!jobsKeyword.trim() || isScraping) return;
    const apiBase = getApiBase();
    setIsScraping(true);
    try {
      const res = await fetch(`${apiBase}/start-scraping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            keyword: jobsKeyword,
            location: location,      // Ville envoyée au back
            contract_type: contractType // Type de contrat envoyé au back
        }),
      });
      const data = await res.json();
      onJobsLoaded(data?.jobs || []);
      onOpenJobs();
      toast.success("Offres récupérées !");
    } catch {
      toast.error("Le scraping a échoué.");
    } finally {
      setIsScraping(false);
    }
  }

  async function sendChat() {
    if (!chatDraft.trim() || chatLoading) return;
    const apiBase = getApiBase();
    setChatLoading(true);
    const newHistory: ChatItem[] = [...chatHistory, { role: "user", content: chatDraft }];
    setChatHistory(newHistory);
    setChatDraft("");
    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatDraft, history: newHistory, cv_context: cvContext, audit_context: audit }),
      });
      const data = await res.json();
      if (data?.reply_markdown) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.reply_markdown }]);
      }
    } catch {
      toast.error("Erreur de discussion.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col items-center mb-4 border-b pb-4 dark:border-slate-800">
        <AlexCV className="w-40 md:w-48 drop-shadow-lg" />
        <h2 className="text-lg font-bold mt-2">AI Career Boost</h2>
      </div>

      <div className="mb-4">
        <PdfDropzone value={pdf} onChange={setPdf} />
        {loading && <div className="mt-2 text-center text-sm text-blue-600 animate-pulse">ALEX analyse ton document...</div>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Audit ALEX</label>
          {error && <div className="text-rose-500 text-xs mb-1">{error}</div>}
          <textarea
            value={audit}
            readOnly
            className="h-64 w-full rounded-xl border p-3 text-xs font-mono dark:bg-slate-950/30"
            placeholder="L'audit s'affichera ici après l'envoi."
          />
        </div>

        {/* ✅ SECTION FILTRES DYNAMIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Poste</label>
            <input
                value={jobsKeyword}
                onChange={(e) => setJobsKeyword(e.target.value)}
                className="w-full rounded-xl border p-2 text-sm dark:bg-slate-900"
                placeholder="Poste..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Ville</label>
            <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border p-2 text-sm dark:bg-slate-900"
                placeholder="Paris, Lyon..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Contrat</label>
            <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full rounded-xl border p-2 text-sm dark:bg-slate-900"
            >
                <option value="">Tous</option>
                <option value="CDI">CDI</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
            </select>
          </div>
        </div>

        <button
            onClick={startScraping}
            disabled={!audit || isScraping}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                isScraping ? "bg-slate-700 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500"
            }`}
        >
            {isScraping ? "ALEX explore le web..." : "🔍 Trouver des offres"}
        </button>

        <div className="border-t pt-4 dark:border-slate-800">
          <div className="h-40 overflow-y-auto mb-3 space-y-2 px-1">
            {chatHistory.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className={`inline-block px-3 py-2 rounded-xl text-sm ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                }`}>
                  {m.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              className="flex-1 rounded-xl border p-2 text-sm dark:bg-slate-900"
              placeholder="Question ?"
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            />
            <button onClick={sendChat} className="bg-blue-600 text-white px-4 rounded-xl text-sm font-bold">OK</button>
          </div>
        </div>
      </div>
    </section>
  );
}