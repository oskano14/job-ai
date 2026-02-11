type Props = {
  value: "light" | "dark";
  onChange: (next: "light" | "dark") => void;
};

function IconSun({ className }: { className?: string }) {
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
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ value, onChange }: Props) {
  const isDark = value === "dark";

  return (
    <button
      type="button"
      onClick={() => onChange(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? (
        <IconMoon className="h-4 w-4 text-blue-500" />
      ) : (
        <IconSun className="h-4 w-4 text-blue-600" />
      )}
      <span className="hidden sm:inline">{isDark ? "Sombre" : "Clair"}</span>
    </button>
  );
}

