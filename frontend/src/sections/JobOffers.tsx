export type Job = {
  title: string;
  company_name: string;
  location: string;
  thumbnail: string | null;
  link: string | null;
};

type Props = {
  jobs: Job[];
};

export default function JobOffers({ jobs }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Offres d'emploi</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Grille de suggestions (sans score pour l’instant).
          </p>
        </div>
      </div>

      {!jobs.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
          Aucune offre pour l’instant. Lance une analyse CV puis clique sur “Trouver des offres…”.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <article
            key={`${job.title}-${job.company_name}-${job.location}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/30"
          >
            <div className="flex items-start gap-3">
              {job.thumbnail ? (
                <img
                  src={job.thumbnail}
                  alt=""
                  className="mt-0.5 h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain dark:border-slate-800"
                  loading="lazy"
                />
              ) : (
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                  {job.company_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                  {job.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {job.company_name}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{job.location}</p>
              </div>
            </div>

            <div className="mt-4">
              {job.link ? (
                <a
                  href={job.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Voir l'offre
                </a>
              ) : (
                <div className="w-full rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Lien non disponible
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
