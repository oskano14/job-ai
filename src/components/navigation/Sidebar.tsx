import type { SectionKey } from "../../App";
import { navItems } from "./navItems";

type Props = {
  section: SectionKey;
  onSectionChange: (next: SectionKey) => void;
};

export default function Sidebar({ section, onSectionChange }: Props) {
  return (
    <aside className="hidden w-72 shrink-0 md:block">
      <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Menu
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = item.key === section;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={[
                  "group flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "mt-0.5 h-5 w-5",
                    active ? "text-white" : "text-blue-600 dark:text-blue-500",
                  ].join(" ")}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  <span
                    className={[
                      "block truncate text-xs",
                      active ? "text-blue-50/90" : "text-slate-500 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
          Astuce : utilisez le mode sombre pour un meilleur confort visuel.
        </div>
      </div>
    </aside>
  );
}

