import type { SectionKey } from "../../App";
import { navItems } from "./navItems";

type Props = {
  open: boolean;
  section: SectionKey;
  onClose: () => void;
  onSectionChange: (next: SectionKey) => void;
};

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function MobileSidebar({ open, section, onClose, onSectionChange }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <div className="absolute left-3 top-3 w-[calc(100%-24px)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">Menu</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
            aria-label="Fermer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = item.key === section;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSectionChange(item.key);
                  onClose();
                }}
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
      </div>
    </div>
  );
}

