import { AlexExplain } from "../components/illustration/alex_explain";

export default function InterviewSimulator() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 min-h-[600px] flex flex-col items-center justify-center">
      
      {/* Effets de lumière en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative flex flex-col items-center justify-center group z-10">
        
        {/* Illustration ALEX avec effet de flottement */}
        <div className="relative mb-12 animate-bounce-slow">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
          <div className="relative bg-white/40 dark:bg-slate-800/40 p-8 rounded-full backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-2xl">
            <AlexExplain
              className="w-48 md:w-56 drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* Contenu textuel */}
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Nouvelle Feature
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
            Simulateur d'entretien <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Bientôt disponible
            </span>
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
            ALEX s'entraîne encore un peu pour vous offrir une expérience vocale ultra-réaliste. Préparez-vous à simuler vos entretiens avec une IA qui analyse votre ton, votre structure et votre impact.
          </p>

          {/* Barre de progression fictive */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[85%] rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Développement</span>
            <span>85% Terminé</span>
          </div>
        </div>
      </div>

      {/* Style additionnel pour l'animation de flottement */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}