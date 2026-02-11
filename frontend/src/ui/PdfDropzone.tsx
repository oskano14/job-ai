import { useCallback, useRef, useState } from "react";

export type PdfMeta = {
  file: File;
  name: string;
  size: number;
  lastModified: number;
};

type Props = {
  value: PdfMeta | null;
  onChange: (next: PdfMeta | null) => void;
};

function FileIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

export default function PdfDropzone({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  const pick = useCallback(() => inputRef.current?.click(), []);

  const acceptFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      if (file.type !== "application/pdf") return;
      onChange({
        file,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });
    },
    [onChange],
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          PDF (CV)
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            Retirer
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={pick}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          acceptFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          "flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition",
          drag
            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/60",
        ].join(" ")}
      >
        <FileIcon
          className={[
            "h-10 w-10",
            drag ? "text-blue-600" : "text-slate-400 dark:text-slate-500",
          ].join(" ")}
        />
        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Déposez votre CV (PDF)
        </div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Glissez-déposez ici ou cliquez pour sélectionner.
        </div>
        {value ? (
          <div className="mt-3 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
            <div className="truncate font-semibold">{value.name}</div>
            <div className="text-slate-500 dark:text-slate-400">
              {Math.round(value.size / 1024)} Ko · modifié{" "}
              {new Date(value.lastModified).toLocaleDateString("fr-FR")}
            </div>
          </div>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])}
      />

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Note : cette UI prépare l’intégration (analyse OCR/LLM) côté backend.
      </div>
    </div>
  );
}
