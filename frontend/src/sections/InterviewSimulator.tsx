import { useMemo, useState } from "react";
import { AlexExplain } from "../components/illustration/alex_explain";
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: Date;
};

function uuid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v4" />
      <path d="M8 23h8" />
    </svg>
  );
}

export default function InterviewSimulator() {
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uuid(),
      role: "assistant",
      content:
        "Bonjour ! Je suis votre coach. Dites-moi le poste visé et je lance une simulation d’entretien.",
      at: new Date(),
    },
  ]);

  const header = useMemo(
    () =>
      listening
        ? "Micro actif — parlez naturellement."
        : "Interface minimaliste — micro central + chat.",
    [listening],
  );

  function send() {
    const value = draft.trim();
    if (!value) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      { id: uuid(), role: "user", content: value, at: now },
      {
        id: uuid(),
        role: "assistant",
        content:
          "Reçu. Je vais vous poser une première question : présentez-vous en 60 secondes, en mettant l’accent sur votre impact.",
        at: new Date(now.getTime() + 250),
      },
    ]);
    setDraft("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">

      <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 group">
        {/* Effet carte premium */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl backdrop-blur-sm shadow-xl">
            <AlexExplain
              className="
          w-56 md:w-64
          drop-shadow-md
          group-hover:drop-shadow-xl
          transition-all 
          duration-500 
          ease-out
        "
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Simulateur d'entretien
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Prépare-toi avec ALEX pour ton prochain entretien
        </p>
      </div>

      <div className="mb-3">
        <h2 className="text-base font-semibold tracking-tight">Simulateur d'entretien</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{header}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Micro
            </div>
            <span
              className={[
                "rounded-full px-2 py-1 text-xs font-semibold",
                listening
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
              ].join(" ")}
            >
              {listening ? "ON" : "OFF"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setListening((v) => !v)}
              className={[
                "relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition",
                "hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30",
                listening ? "shadow-glow" : "",
              ].join(" ")}
              aria-label={listening ? "Désactiver le micro" : "Activer le micro"}
            >
              <MicIcon className="h-10 w-10" />
              {listening ? (
                <span className="pointer-events-none absolute -inset-4 animate-pulse rounded-full border border-blue-600/30" />
              ) : null}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            Conseil : entraînez-vous à répondre avec structure (Contexte → Actions → Résultats).
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/30">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-50">
            Chat
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={[
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
                    ].join(" ")}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={[
                        "mt-1 text-[11px]",
                        isUser ? "text-blue-50/90" : "text-slate-500 dark:text-slate-400",
                      ].join(" ")}
                    >
                      {formatTime(m.at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                placeholder="Écrivez votre réponse…"
              />
              <button
                type="button"
                onClick={send}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Envoyer
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Astuce : appuyez sur Entrée pour envoyer.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

