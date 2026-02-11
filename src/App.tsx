import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";
import CvAnalysis from "./sections/CvAnalysis";
import InterviewSimulator from "./sections/InterviewSimulator";
import JobOffers from "./sections/JobOffers";

export type SectionKey = "cv" | "jobs" | "interview";

const STORAGE_THEME_KEY = "aicb_theme";

function getInitialTheme(): "light" | "dark" {
  const saved = localStorage.getItem(STORAGE_THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export default function App() {
  const [section, setSection] = useState<SectionKey>("cv");
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  const content = useMemo(() => {
    switch (section) {
      case "cv":
        return <CvAnalysis />;
      case "jobs":
        return <JobOffers />;
      case "interview":
        return <InterviewSimulator />;
    }
  }, [section]);

  return (
    <DashboardLayout
      section={section}
      onSectionChange={setSection}
      theme={theme}
      onThemeChange={setTheme}
    >
      {content}
    </DashboardLayout>
  );
}

