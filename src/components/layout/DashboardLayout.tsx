import type { ReactNode } from "react";
import { useState } from "react";
import type { SectionKey } from "../../App";
import Sidebar from "../navigation/Sidebar";
import MobileSidebar from "../navigation/MobileSidebar";
import ThemeToggle from "../navigation/ThemeToggle";

type Props = {
  children: ReactNode;
  section: SectionKey;
  onSectionChange: (next: SectionKey) => void;
  theme: "light" | "dark";
  onThemeChange: (next: "light" | "dark") => void;
};

export default function DashboardLayout({
  children,
  section,
  onSectionChange,
  theme,
  onThemeChange,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar section={section} onSectionChange={onSectionChange} />
        <main className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="mb-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white md:hidden dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
                aria-label="Ouvrir le menu"
              >
                <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                Menu
              </button>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                AI Career Boost
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Dashboard de coaching emploi
              </p>
            </div>
            <ThemeToggle value={theme} onChange={onThemeChange} />
          </div>
          {children}
        </main>
      </div>
      <MobileSidebar
        open={mobileOpen}
        section={section}
        onClose={() => setMobileOpen(false)}
        onSectionChange={onSectionChange}
      />
    </div>
  );
}
