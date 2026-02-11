type Job = {
  title: string;
  company: string;
  match: number; // 0-100
  location: string;
};

const jobs: Job[] = [
  { title: "Product Manager (IA)", company: "BluePeak", match: 86, location: "Paris · Hybride" },
  { title: "Data Analyst", company: "NovaLab", match: 78, location: "Lyon · Remote" },
  { title: "Développeur Frontend React", company: "CloudMint", match: 91, location: "Nantes · Hybride" },
  { title: "Consultant BI", company: "AsterOne", match: 73, location: "Lille · Sur site" },
  { title: "UX Writer", company: "StudioHorizon", match: 69, location: "Remote" },
  { title: "Customer Success", company: "SaaSline", match: 82, location: "Paris · Hybride" },
];

function MatchPill({ value }: { value: number }) {
  const tone =
    value >= 85
      ? "bg-blue-600 text-white"
      : value >= 75
        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{value}%</span>;
}

export default function JobOffers() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3">
        <h2 className="text-base font-semibold tracking-tight">Offres d'emploi</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Grille de suggestions avec score de compatibilité.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <article
            key={`${job.title}-${job.company}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {job.title}
                </h3>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{job.company}</p>
              </div>
              <MatchPill value={job.match} />
            </div>

            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{job.location}</span>
                <span>Compatibilité</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${job.match}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Voir détails
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Sauvegarder
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

