import { useMemo, useState } from "react";
import PdfDropzone, { type PdfMeta } from "../ui/PdfDropzone";

export default function CvAnalysis() {
  const [pdf, setPdf] = useState<PdfMeta | null>(null);
  const [text, setText] = useState(
    "Collez ici votre CV (texte) ou saisissez une version à corriger…",
  );

  const helper = useMemo(() => {
    if (!pdf) return "Déposez un PDF pour démarrer l'analyse.";
    return `PDF chargé : ${pdf.name} (${Math.round(pdf.size / 1024)} Ko)`;
  }, [pdf]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3">
        <h2 className="text-base font-semibold tracking-tight">Analyse CV</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{helper}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-h-[420px]">
          <PdfDropzone value={pdf} onChange={setPdf} />
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
    </section>
  );
}

