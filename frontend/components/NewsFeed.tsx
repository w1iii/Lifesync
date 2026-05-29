import type { Briefing } from "@/types";

interface Props {
  briefing?: Briefing | null;
}

export default function NewsFeed({ briefing }: Props) {
  const articles = briefing?.modules?.news?.articles ?? [];

  if (articles.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mt-16 px-margin-mobile">
      <h2 className="font-display-sm text-display-sm text-primary mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary">rss_feed</span>
        News Digest
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {articles.map((article) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-container-padding rounded-lg group hover:bg-secondary/5 transition-all block"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-container px-2 py-0.5 rounded-full">
                {article.source}
              </span>
              {article.relevance_score && (
                <span className="text-[10px] text-on-surface-variant ml-auto">
                  {Math.round(article.relevance_score * 100)}%
                </span>
              )}
            </div>
            <h3 className="font-body-md text-body-md font-bold text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
              {article.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">
              {article.summary}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}