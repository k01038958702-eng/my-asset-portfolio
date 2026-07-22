import type { StoredAsset } from "@/components/asset-manager";
import type { StoredLoan } from "@/components/loan-manager";
import type { StoredCashflow } from "@/components/cashflow-manager";

type Diagnostic = { tone: "good" | "check" | "warning"; title: string; detail: string };

export default function FinancialCoach({ assets, loans, cashflows }: { assets: StoredAsset[]; loans: StoredLoan[]; cashflows: StoredCashflow[] }) {
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalDebt = loans.reduce((sum, item) => sum + item.balance, 0);
  const income = cashflows.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = cashflows.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const cashAssets = assets.filter((item) => item.category === "현금" || item.category === "예금·적금").reduce((sum, item) => sum + item.amount, 0);
  const realEstateAssets = assets.filter((item) => item.category === "부동산").reduce((sum, item) => sum + item.amount, 0);
  const hasMortgageLoan = loans.some((item) => /주택|담보|모기지/.test(item.name));
  const categories = assets.reduce<Record<string, number>>((result, item) => ({ ...result, [item.category]: (result[item.category] || 0) + item.amount }), {});
  const largestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const cashRatio = totalAssets ? cashAssets / totalAssets : 0;
  const debtRatio = totalAssets ? totalDebt / totalAssets : 0;
  const expenseRatio = income ? expense / income : 0;
  const concentrationRatio = totalAssets && largestCategory ? largestCategory[1] / totalAssets : 0;
  let score = 100;
  const diagnostics: Diagnostic[] = [];

  if (hasMortgageLoan && !realEstateAssets) {
    score -= 5;
    diagnostics.push({ tone: "check", title: "부동산 자산이 빠져 있을 수 있습니다", detail: "주택 관련 대출은 등록되어 있지만 부동산 자산이 없습니다. 보유 주택이 있다면 대출을 빼지 않은 현재 시가 전체를 자산으로 등록해 주세요." });
  }

  if (!totalAssets) { score -= 25; diagnostics.push({ tone: "check", title: "자산 정보를 더 입력해 주세요", detail: "자산 구성이 등록되면 현금 비중과 집중도를 진단할 수 있습니다." }); }
  else if (cashRatio < 0.05) { score -= 20; diagnostics.push({ tone: "warning", title: "현금성 자산 비중이 낮습니다", detail: `현금·예금 비중이 ${(cashRatio * 100).toFixed(1)}%입니다. 예상치 못한 지출에 대비할 여유자금을 점검해 보세요.` }); }
  else { diagnostics.push({ tone: "good", title: "현금성 자산이 확인됩니다", detail: `현금·예금 비중은 ${(cashRatio * 100).toFixed(1)}%입니다.` }); }

  if (debtRatio > 0.7) { score -= 30; diagnostics.push({ tone: "warning", title: "부채 부담을 우선 점검하세요", detail: `부채가 총자산의 ${(debtRatio * 100).toFixed(1)}%입니다. 금리와 월 상환 부담을 함께 확인해 보세요.` }); }
  else if (debtRatio > 0.4) { score -= 15; diagnostics.push({ tone: "check", title: "부채 비율을 지켜볼 필요가 있습니다", detail: `부채가 총자산의 ${(debtRatio * 100).toFixed(1)}%입니다.` }); }
  else if (totalAssets) { diagnostics.push({ tone: "good", title: "부채 비율이 비교적 안정적입니다", detail: `부채가 총자산의 ${(debtRatio * 100).toFixed(1)}%입니다.` }); }

  if (concentrationRatio > 0.7 && largestCategory) { score -= 15; diagnostics.push({ tone: "check", title: `${largestCategory[0]} 비중이 높습니다`, detail: `한 자산 분류에 ${(concentrationRatio * 100).toFixed(1)}%가 집중되어 있어 변동 영향을 크게 받을 수 있습니다.` }); }
  if (!income) { score -= 10; diagnostics.push({ tone: "check", title: "고정수입을 등록해 주세요", detail: "월 현금흐름을 입력하면 고정지출 부담을 진단할 수 있습니다." }); }
  else if (expenseRatio > 0.8) { score -= 20; diagnostics.push({ tone: "warning", title: "고정지출 비율이 높습니다", detail: `고정수입의 ${(expenseRatio * 100).toFixed(1)}%가 고정지출로 나갑니다.` }); }
  else if (expenseRatio > 0.6) { score -= 10; diagnostics.push({ tone: "check", title: "고정지출 여유가 크지 않습니다", detail: `고정수입의 ${(expenseRatio * 100).toFixed(1)}%가 고정지출입니다.` }); }
  else if (income) { diagnostics.push({ tone: "good", title: "월 고정 현금흐름이 양호합니다", detail: `고정수입에서 지출을 뺀 금액은 월 ${(income - expense).toLocaleString("ko-KR")}원입니다.` }); }

  score = Math.max(0, Math.min(100, score));
  const grade = score >= 85 ? "건강" : score >= 65 ? "보통" : "점검 필요";

  return <article className="feature-card coach-card live-coach" id="financial-coach">
    <div className="coach-score"><strong>{score}</strong><span>자산 건강점수</span><b>{grade}</b></div>
    <div className="feature-content coach-content"><span className="coming-soon">실제 데이터 자동 진단</span><h2>자산 건강 코치</h2><div className="diagnostic-list">{diagnostics.slice(0, 4).map((item) => <div className={`diagnostic-item ${item.tone}`} key={item.title}><i /><span><strong>{item.title}</strong><small>{item.detail}</small></span></div>)}</div><p className="coach-disclaimer">건강점수는 서비스 내부 점검 기준이며 신용점수나 투자성과 예측이 아닙니다.</p></div>
  </article>;
}
