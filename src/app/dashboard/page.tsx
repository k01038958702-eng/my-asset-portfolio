"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import AssetManager, { type StoredAsset } from "@/components/asset-manager";
import LoanManager, { type StoredLoan } from "@/components/loan-manager";
import CashflowManager, { type StoredCashflow } from "@/components/cashflow-manager";
import ProfileManager, { type StoredProfile } from "@/components/profile-manager";
import FinancialCoach from "@/components/financial-coach";
import AssetHistory from "@/components/asset-history";
import MonthlySavings from "@/components/monthly-savings";
import ImageExport from "@/components/image-export";
import AccountSettings from "@/components/account-settings";

const categoryColors: Record<string, string> = { "현금": "#1cb790", "예금·적금": "#4174f6", "국내주식": "#7c5ce7", "해외주식·ETF": "#8b62e8", "코인": "#f2a63b", "부동산": "#d66a55", "전월세 보증금": "#d89162", "연금·퇴직계좌": "#4c91b8", "자동차": "#7185a3", "기타 자산": "#9aa5b6" };
const won = new Intl.NumberFormat("ko-KR");
const ageBenchmarks = [
  { maxAge: 39, label: "39세 이하", averageAssets: 314_980_000 },
  { maxAge: 49, label: "40~49세", averageAssets: 627_140_000 },
  { maxAge: 59, label: "50~59세", averageAssets: 662_050_000 },
  { maxAge: 200, label: "60세 이상", averageAssets: 600_950_000 },
];

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(isFirebaseConfigured);
  const [storedAssets, setStoredAssets] = useState<StoredAsset[]>([]);
  const [storedLoans, setStoredLoans] = useState<StoredLoan[]>([]);
  const [storedCashflows, setStoredCashflows] = useState<StoredCashflow[]>([]);
  const [profile, setProfile] = useState<StoredProfile | null>(null);

  const totalAssets = storedAssets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalDebt = storedLoans.reduce((sum, loan) => sum + loan.balance, 0);
  const netAssets = totalAssets - totalDebt;
  const fixedIncome = storedCashflows.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const fixedExpense = storedCashflows.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const setupSteps = [
    { label: "자산 등록", href: "#asset-management", done: storedAssets.length > 0 },
    { label: "대출 확인", href: "#loan-management", done: storedLoans.length > 0 },
    { label: "고정수입 등록", href: "#cashflow-management", done: fixedIncome > 0 },
  ];
  const completedSetupSteps = setupSteps.filter((step) => step.done).length;
  const currentAge = profile ? new Date().getFullYear() - profile.birthYear : null;
  const ageBand = currentAge ? `${Math.floor(currentAge / 10) * 10}대` : "연령 미입력";
  const ageBenchmark = currentAge ? ageBenchmarks.find((item) => currentAge <= item.maxAge) : null;
  const canCompare = Boolean(profile?.comparisonBasis === "household" && ageBenchmark && totalAssets > 0);
  const benchmarkRatio = ageBenchmark?.averageAssets ? (totalAssets / ageBenchmark.averageAssets) * 100 : 0;
  const assetGrade = benchmarkRatio >= 150 ? 1 : benchmarkRatio >= 100 ? 2 : benchmarkRatio >= 70 ? 3 : benchmarkRatio >= 40 ? 4 : 5;
  const groupedAssets = Object.entries(
    storedAssets.reduce<Record<string, number>>((groups, asset) => {
      groups[asset.category] = (groups[asset.category] || 0) + asset.amount;
      return groups;
    }, {}),
  ).map(([name, amount]) => ({
    name,
    amount,
    ratio: totalAssets ? (amount / totalAssets) * 100 : 0,
    color: categoryColors[name] || categoryColors["기타 자산"],
  })).sort((a, b) => b.amount - a.amount);
  const chartSegments = groupedAssets.map((asset, index) => {
    const start = groupedAssets.slice(0, index).reduce((sum, item) => sum + item.ratio, 0);
    const end = start + asset.ratio;
    return `${asset.color} ${start}% ${end}%`;
  });
  const donutBackground = chartSegments.length ? `conic-gradient(${chartSegments.join(",")})` : "#e8ebf1";

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      if (!currentUser) {
        window.location.replace("/login");
        return;
      }
      setUser(currentUser);
      setCheckingAuth(false);
    });
  }, []);

  async function logout() {
    await signOut(getFirebaseAuth());
    window.location.replace("/login");
  }

  if (checkingAuth) {
    return <main className="auth-loading"><span className="brand-mark">M</span><strong>자산 정보를 안전하게 불러오는 중...</strong></main>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="내 자산 포트폴리오 공개 홈">
          <span className="brand-mark">M</span>
          <span>내 자산 포트폴리오</span>
        </Link>
        <div className="header-actions">
          <span className="stage-badge">실제 자산 연결됨</span>
          {user && <div className="user-menu">
            <span className="user-avatar">{(user.displayName || user.email || "U").slice(0, 1)}</span>
            <span className="user-copy"><strong>{user.displayName || "사용자"}</strong><small>{user.email}</small></span>
            <button type="button" onClick={logout}>로그아웃</button>
          </div>}
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">MY MONEY DASHBOARD</p>
            <h1>내 돈의 흐름을 한눈에</h1>
            <p className="hero-copy">
              흩어진 자산과 부채를 모아 보고, 더 건강한 돈 관리를 시작하세요.
            </p>
          </div>
          <div className="hero-actions">
            <ImageExport />
            <div className="sample-note"><span className="sample-dot" /> 자산 데이터는 사용자 계정에 안전하게 저장돼요</div>
          </div>
        </section>

        <section className="summary-grid" aria-label="자산 요약">
          <article className="summary-card primary-card">
            <a className="summary-link" href="#asset-management">
              <div className="card-label-row">
                <span>총자산</span>
                <span className="trend"><ArrowUpRight /> 자산 관리하기</span>
              </div>
              <strong>{won.format(totalAssets)}<small>원</small></strong>
              <p>보유한 모든 자산의 합계 · 클릭해서 자산 등록</p>
            </a>
          </article>
          <article className="summary-card">
            <a className="summary-link" href="#loan-management">
              <div className="card-label-row">
                <span>순자산</span>
                <span className="neutral-pill">대출 관리하기 ↓</span>
              </div>
              <strong>{won.format(netAssets)}<small>원</small></strong>
              <p>총자산 {won.format(totalAssets)}원 − 부채 {won.format(totalDebt)}원</p>
            </a>
          </article>
          <article className="summary-card debt-card">
            <a className="summary-link" href="#loan-management">
              <div className="card-label-row">
                <span>대출·부채</span>
                <span className="debt-pill">{totalAssets ? `총자산의 ${((totalDebt / totalAssets) * 100).toFixed(1)}% · 관리 ↓` : "대출 관리 ↓"}</span>
              </div>
              <strong>{won.format(totalDebt)}<small>원</small></strong>
              <p>등록한 모든 대출 잔액의 합계 · 클릭해서 관리</p>
            </a>
          </article>
          <article className="summary-card rank-card">
            <a className="summary-link" href="#profile-management"><div className="card-label-row"><span>내 연령대 평균 자산 등급</span><span className="estimate-pill">2025 평균 · 내부 5단계 ↓</span></div><div className="rank-value"><strong>{canCompare ? `${assetGrade}등급` : totalAssets ? "가구 기준 필요" : "자산 등록 필요"}</strong><span>{ageBenchmark?.label || ageBand} · {profile?.comparisonBasis === "household" ? `${profile.householdSize}인 가구` : "개인"} 기준</span></div><div className="rank-track pending"><span style={{ width: canCompare ? `${Math.min(Math.max(benchmarkRatio / 1.5, 4), 100)}%` : "8%" }} /></div><div className="rank-labels"><span>{canCompare ? `평균 총자산 ${won.format(ageBenchmark!.averageAssets)}원` : "프로필과 자산을 입력하세요"}</span><span>{canCompare ? `평균 대비 ${benchmarkRatio.toFixed(0)}%` : "부동산은 시가 전체 등록"}</span></div><div className="rank-grade-scale" aria-label="자산 등급 기준"><span className={canCompare && assetGrade === 5 ? "active" : ""}><b>5등급</b><small>40% 미만</small></span><span className={canCompare && assetGrade === 4 ? "active" : ""}><b>4등급</b><small>40~69%</small></span><span className={canCompare && assetGrade === 3 ? "active" : ""}><b>3등급</b><small>70~99%</small></span><span className={canCompare && assetGrade === 2 ? "active" : ""}><b>2등급</b><small>100~149%</small></span><span className={canCompare && assetGrade === 1 ? "active" : ""}><b>1등급</b><small>150% 이상</small></span></div></a>
          </article>
          <article className="summary-card income-card">
            <a className="summary-link" href="#cashflow-management"><div className="card-label-row"><span>월 고정수입</span><span className="income-pill">관리하기 ↓</span></div><strong>{won.format(fixedIncome)}<small>원</small></strong><p>매월 반복되는 고정수입의 합계</p></a>
          </article>
          <article className="summary-card expense-card">
            <a className="summary-link" href="#cashflow-management"><div className="card-label-row"><span>월 고정지출</span><span className="expense-pill">관리하기 ↓</span></div><strong>{won.format(fixedExpense)}<small>원</small></strong><p>매월 반복되는 고정지출의 합계</p></a>
          </article>
        </section>

        <section className="setup-progress" aria-label="자산 등록 진행상태">
          <div className="setup-progress-title">
            <span><b>{completedSetupSteps}</b> / {setupSteps.length}</span>
            <div><strong>자산 등록 진행상태</strong><small>항목을 누르면 바로 입력할 수 있어요</small></div>
          </div>
          <div className="setup-progress-items">
            {setupSteps.map((step) => <a className={step.done ? "done" : ""} href={step.href} key={step.label}><i>{step.done ? "✓" : "→"}</i><span>{step.label}<small>{step.done ? "완료" : "입력하기"}</small></span></a>)}
          </div>
        </section>

        <p className="official-source">연령대 자산 등급 기준: 국가데이터처·한국은행·금융감독원 「2025년 가계금융복지조사」 가구주 연령별 평균 총자산. 등급은 평균 대비 비율을 5단계로 나눈 서비스 내부 지표이며 실제 순위나 백분위가 아닙니다. 주택은 현재 시가 전체를 부동산 자산으로, 주택담보대출은 부채로 각각 등록하세요. <a href="https://mods.go.kr/board.es?act=view&bid=215&list_no=439535&mid=a10301040300" target="_blank" rel="noreferrer">공식 자료 보기</a></p>

        {user && <AssetManager user={user} onAssetsChange={setStoredAssets} />}

        {user && <CashflowManager user={user} onCashflowsChange={setStoredCashflows} />}

        <section className="dashboard-grid">
          <article className="panel allocation-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">PORTFOLIO</p>
                <h2>자산 비중</h2>
              </div>
              <span className="static-label">실제 데이터</span>
            </div>
            <div className="allocation-body">
              <div className="donut" style={{ background: donutBackground }} role="img" aria-label="등록한 자산의 분류별 비중">
                <div className="donut-center"><span>총자산</span><strong>{totalAssets >= 10_000 ? `${(totalAssets / 10_000).toFixed(0)}만` : won.format(totalAssets)}</strong></div>
              </div>
              <div className="legend">
                {groupedAssets.map((asset) => (
                  <div className="legend-row" key={asset.name}>
                    <span className="legend-name"><i style={{ backgroundColor: asset.color }} />{asset.name}</span>
                    <span><strong>{asset.ratio.toFixed(1)}%</strong><span className="private-amount">{won.format(asset.amount)}원</span></span>
                  </div>
                ))}
                {groupedAssets.length === 0 && <div className="empty-assets">자산을 등록하면 비중이 표시됩니다.</div>}
              </div>
            </div>
          </article>

          <article className="panel asset-list-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">ASSETS</p>
                <h2>내 자산 목록</h2>
              </div>
              <span className="static-label">{storedAssets.length}개</span>
            </div>
            <div className="asset-list">
              {storedAssets.slice(0, 4).map((asset) => {
                const color = categoryColors[asset.category] || categoryColors["기타 자산"];
                return (
                <div className="asset-row" key={asset.id}>
                  <span className="asset-icon" style={{ backgroundColor: `${color}18`, color }}>
                    <i style={{ backgroundColor: color }} />
                  </span>
                  <span className="asset-info"><strong>{asset.name}</strong><small>{asset.category}</small></span>
                  <span className="asset-value"><strong className="private-amount">{won.format(asset.amount)}원</strong><small>{totalAssets ? ((asset.amount / totalAssets) * 100).toFixed(1) : "0.0"}%</small></span>
                </div>
              )})}
              {storedAssets.length === 0 && <div className="empty-assets">등록한 자산이 없습니다.</div>}
            </div>
          </article>
        </section>

        <section className="feature-grid">
          <FinancialCoach assets={storedAssets} loans={storedLoans} cashflows={storedCashflows} />
          {user && <ProfileManager user={user} onProfileChange={setProfile} />}
        </section>

        {user && <AssetHistory user={user} totalAssets={totalAssets} totalDebt={totalDebt} />}

        {user && <MonthlySavings user={user} monthlySurplus={fixedIncome - fixedExpense} />}

        {user && <LoanManager user={user} fixedIncome={fixedIncome} onLoansChange={setStoredLoans} />}

        {user && <AccountSettings user={user} />}

        <footer>
          <p>투자 상품의 매수·매도를 권유하지 않으며, 모든 정보는 자산 관리를 위한 참고 자료입니다.</p>
          <span>MY ASSET PORTFOLIO · STEP 01</span>
        </footer>
      </main>
    </div>
  );
}
