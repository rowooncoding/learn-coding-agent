type HeroSummaryProps = {
  openCount: number
  totalCount: number
  filterLabel: string
}

function HeroSummary({
  openCount,
  totalCount,
  filterLabel,
}: HeroSummaryProps) {
  return (
    <section className="hero-panel">
      <p className="eyebrow">PERSONAL TODO WEB</p>
      <div className="hero-copy">
        <h1>오늘 할 일</h1>
        <p>
          바로 추가하고, 체크하고, 지우는 데만 집중한 간단한 todo list입니다.
        </p>
      </div>

      <div className="summary-grid">
        <article className="summary-card accent">
          <span className="summary-label">열린 작업</span>
          <strong>{openCount}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">전체 작업</span>
          <strong>{totalCount}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">현재 보기</span>
          <strong>{filterLabel}</strong>
        </article>
      </div>
    </section>
  )
}

export default HeroSummary
