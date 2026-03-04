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
                AI Career Boost (ALEX)
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

// import type { ReactNode } from "react";
// import { useState } from "react";
// import type { SectionKey } from "../../App";
// import Sidebar from "../navigation/Sidebar";
// import MobileSidebar from "../navigation/MobileSidebar";
// import ThemeToggle from "../navigation/ThemeToggle";
// import { AlexThinking } from "../illustration/alex_thinking"; // ✅ IMPORT AJOUTÉ

// type Props = {
//   children: ReactNode;
//   section: SectionKey;
//   onSectionChange: (next: SectionKey) => void;
//   theme: "light" | "dark";
//   onThemeChange: (next: "light" | "dark") => void;
// };

// export default function DashboardLayout({
//   children,
//   section,
//   onSectionChange,
//   theme,
//   onThemeChange,
// }: Props) {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <div className="min-h-dvh">
//       <div className="mx-auto flex min-h-dvh w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
//         <Sidebar section={section} onSectionChange={onSectionChange} />
//         <main className="flex-1">
//           <div className="mb-4 flex items-center justify-between">
//             <div>
//               <button
//                 type="button"
//                 onClick={() => setMobileOpen(true)}
//                 className="mb-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white md:hidden dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
//                 aria-label="Ouvrir le menu"
//               >
//                 <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
//                 Menu
//               </button>
//               <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
//                 AI Career Boost
//               </h1>
//               <p className="text-sm text-slate-600 dark:text-slate-300">
//                 Dashboard de coaching emploi
//               </p>
//             </div>
//             <ThemeToggle value={theme} onChange={onThemeChange} />
//           </div>

//           {/* ✅ BANNIÈRE D'ACCUEIL AVEC ALEX THINKING */}
//           <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 mb-6 p-6 group">

//             {/* Éléments décoratifs */}
//             <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-grid-slate-800 opacity-50"></div>
//             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
//             <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

//             <div className="relative flex flex-col items-center text-center">

//               {/* Image ALEX avec animation */}
//               <div className="relative">
//                 <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
//                 <div className="relative animate-float">
//                   <AlexThinking
//                     className="
//                       w-32 md:w-40 lg:w-48
//                       drop-shadow-xl
//                       group-hover:drop-shadow-2xl
//                       group-hover:scale-105
//                       transition-all
//                       duration-700
//                       ease-out
//                     "
//                   />
//                 </div>
//               </div>

//               {/* Texte d'accueil */}
//               <h2 className="text-2xl md:text-3xl font-bold mt-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
//                 Bienvenue sur ALEX
//               </h2>
//               <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-lg">
//                 Ton assistant IA personnel pour analyser ton CV, trouver des offres et préparer tes entretiens.
//               </p>

//               {/* Indicateur de section active */}
//               <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs font-medium">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
//                 </span>
//                 Section active : <span className="font-bold text-blue-600 dark:text-blue-400">{section}</span>
//               </div>
//             </div>
//           </div>

//           {/* Contenu des pages (CvAnalysis, JobOffers, etc.) */}
//           {children}
//         </main>
//       </div>
//       <MobileSidebar
//         open={mobileOpen}
//         section={section}
//         onClose={() => setMobileOpen(false)}
//         onSectionChange={onSectionChange}
//       />

//       {/* Animation CSS */}
//       <style>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-10px); }
//         }
//         .animate-float {
//           animation: float 5s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }