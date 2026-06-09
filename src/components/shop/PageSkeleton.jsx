export default function PageSkeleton() {
  const cards = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="page-skeleton" aria-label="页面加载中">
      <div className="page-skeleton-search skeleton-shimmer" />
      <section className="page-skeleton-hero">
        <div className="page-skeleton-copy">
          <span className="page-skeleton-line skeleton-shimmer wide" />
          <span className="page-skeleton-line skeleton-shimmer" />
          <span className="page-skeleton-pill skeleton-shimmer" />
        </div>
      </section>
      <div className="page-skeleton-tabs">
        {cards.map((item) => (
          <span key={item} className="page-skeleton-tab skeleton-shimmer" />
        ))}
      </div>
      <div className="page-skeleton-grid">
        {cards.map((item) => (
          <article key={item} className="page-skeleton-card">
            <span className="page-skeleton-cover skeleton-shimmer" />
            <span className="page-skeleton-line skeleton-shimmer" />
            <span className="page-skeleton-line skeleton-shimmer short" />
          </article>
        ))}
      </div>
    </div>
  );
}
