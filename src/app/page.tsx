import Link from "next/link";

function CheckIcon() {
  return <span className="landing-check" aria-hidden="true">✓</span>;
}

export default function PublicHomePage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="brand" href="/" aria-label="내 자산 포트폴리오 홈">
          <span className="brand-mark">M</span>
          <span>내 자산 포트폴리오</span>
        </Link>
        <nav aria-label="주요 메뉴">
          <a href="#features">주요 기능</a>
          <a href="#safety">안내</a>
          <Link className="landing-login" href="/login">로그인</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">MY MONEY, ONE CLEAR VIEW</p>
            <h1><span>내 자산을 한눈에,</span><em><span>이제 내 자산을 직접</span><span>관리하세요 !</span></em></h1>
            <p>현금부터 부동산과 대출까지 직접 기록하고, 내 자산의 비중과 돈의 흐름을 보기 쉽게 확인할 수 있습니다.</p>
            <div className="landing-actions">
              <Link className="landing-primary" href="/login">무료로 시작하기 <span>→</span></Link>
              <Link className="landing-secondary" href="/login">기존 계정 로그인</Link>
            </div>
            <ul className="landing-benefits">
              <li><CheckIcon />간편한 Google 로그인</li>
              <li><CheckIcon />사용자별 데이터 분리 저장</li>
            </ul>
          </div>

          <div className="landing-preview" aria-label="자산 대시보드 화면 예시">
            <div className="landing-preview-top">
              <span><i /> 내 자산 현황</span>
              <b>화면 예시</b>
            </div>
            <div className="landing-preview-cards">
              <article><span>총자산</span><strong>348,500,000<small>원</small></strong><p>보유 자산의 전체 합계</p></article>
              <article><span>순자산</span><strong>221,700,000<small>원</small></strong><p>총자산에서 부채를 제외</p></article>
            </div>
            <div className="landing-preview-chart">
              <div className="landing-donut"><span>자산 비중</span><strong>100%</strong></div>
              <div className="landing-preview-legend">
                <p><i className="blue" />부동산 <b>51.6%</b></p>
                <p><i className="purple" />해외주식·ETF <b>22.4%</b></p>
                <p><i className="green" />예금·적금 <b>16.2%</b></p>
                <p><i className="yellow" />기타 자산 <b>9.8%</b></p>
              </div>
            </div>
            <div className="landing-coach-sample"><span>자산 건강 코치</span><p>현재 자산 구성에서 점검할 부분을 알기 쉽게 안내해 드려요.</p></div>
          </div>
        </section>

        <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <p>한 곳에서 간편하게</p>
            <h2>내 돈을 이해하는 데 필요한 기능</h2>
            <span>복잡한 금융 용어보다 내 자산의 현재 상태를 쉽게 확인하는 데 집중했습니다.</span>
          </div>
          <div className="landing-feature-grid">
            <article><i>₩</i><h3>자산·부채 통합 관리</h3><p>현금, 예금, 주식, 부동산, 연금과 대출을 등록해 총자산과 순자산을 자동으로 계산합니다.</p></article>
            <article><i>◔</i><h3>자산 비중 한눈에</h3><p>종류별 자산 비중을 차트로 확인하고, 내 자산 구성이 어디에 집중되어 있는지 살펴봅니다.</p></article>
            <article><i>✓</i><h3>자산 건강 코치</h3><p>비상금, 부채 부담과 자산 집중도처럼 놓치기 쉬운 점검 항목을 이해하기 쉬운 말로 안내합니다.</p></article>
            <article><i>↗</i><h3>월별 변화와 저축 기록</h3><p>월별 자산 변화를 남기고 매월 목표 저축액과 실제 저축액을 함께 확인합니다.</p></article>
            <article><i>1</i><h3>연령대 평균 자산 등급</h3><p>공식 통계의 연령대별 평균 총자산과 비교한 내부 5단계 등급을 참고 지표로 제공합니다.</p></article>
            <article><i>↓</i><h3>포트폴리오 이미지 저장</h3><p>자산 비중과 목록, 건강 코치 결과를 한 장의 이미지로 저장할 수 있습니다.</p></article>
          </div>
        </section>

        <section className="landing-safety" id="safety">
          <div>
            <p>서비스 운영 원칙</p>
            <h2>투자를 추천하지 않습니다.<br />건강한 자산 관리를 돕습니다.</h2>
          </div>
          <ul>
            <li><CheckIcon /><span><strong>특정 금융상품 매수·매도 권유 없음</strong><small>자산 현황과 점검 정보를 참고용으로 제공합니다.</small></span></li>
            <li><CheckIcon /><span><strong>금융계좌 비밀번호 수집 없음</strong><small>사용자가 직접 입력한 자산 정보만 저장합니다.</small></span></li>
            <li><CheckIcon /><span><strong>내 계정과 데이터 직접 삭제</strong><small>대시보드에서 계정과 저장 데이터를 언제든 삭제할 수 있습니다.</small></span></li>
          </ul>
        </section>

        <section className="landing-cta">
          <span className="brand-mark">M</span>
          <h2>오늘부터 내 자산을 한눈에</h2>
          <p>첫 자산을 등록하고 내 돈의 현재 모습을 확인해 보세요.</p>
          <Link className="landing-primary" href="/login">내 자산 관리 시작하기 <span>→</span></Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>MY ASSET PORTFOLIO</span>
        <p>본 서비스의 모든 정보는 자산 관리를 위한 참고 자료이며 투자 권유가 아닙니다.</p>
        <div className="landing-footer-links"><Link href="/privacy">개인정보 처리 안내</Link><Link href="/terms">이용약관</Link><Link href="/login">로그인</Link></div>
      </footer>
    </div>
  );
}
