type HeroSummaryProps = {
  openCount: number
  totalCount: number
  filterLabel: string
  userLabel?: string
  title?: string
  description?: string
  showSummary?: boolean
}

function HeroSummary({
  openCount,
  totalCount,
  filterLabel,
  userLabel,
  title = '오늘 할 일',
  description = '바로 추가하고, 체크하고, 지우는 데만 집중한 간단한 todo list입니다.',
  showSummary = true,
}: HeroSummaryProps) {
  return (
    <section className="hero-panel">
      <p className="eyebrow">PERSONAL TODO WEB</p>
      <div className="hero-copy">
        <h1>{title}</h1>
        <p>{description}</p>
        {userLabel ? <span className="hero-user">{userLabel}</span> : null}
      </div>

      {showSummary ? (
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
      ) : null}
    </section>
  )
}

export default HeroSummary
