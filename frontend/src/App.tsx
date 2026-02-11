import { useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/layout/DashboardLayout";
import CvAnalysis from "./sections/CvAnalysis";
import InterviewSimulator from "./sections/InterviewSimulator";
import JobOffers, { type Job } from "./sections/JobOffers";

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
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  const content = useMemo(() => {
    switch (section) {
      case "cv":
        return (
          <CvAnalysis
            onJobsLoaded={(next) => setJobs(next)}
            onOpenJobs={() => setSection("jobs")}
          />
        );
      case "jobs":
        return <JobOffers jobs={jobs} />;
      case "interview":
        return <InterviewSimulator />;
    }
  }, [jobs, section]);

  return (
    <>
      <DashboardLayout
        section={section}
        onSectionChange={setSection}
        theme={theme}
        onThemeChange={setTheme}
      >
        {content}
      </DashboardLayout>
      <Toaster
        position="bottom-center"
        containerStyle={{ bottom: 96 }}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "16px",
          },
        }}
      />
    </>
  );
}
