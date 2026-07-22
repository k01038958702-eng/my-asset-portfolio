"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

type Snapshot = { id: string; month: string; totalAssets: number; totalDebt: number; netAssets: number };
type SavingsRecord = { month: string; targetAmount: number; savedAmount: number };
const won = new Intl.NumberFormat("ko-KR");

export default function AssetHistory({ user, totalAssets, totalDebt }: { user: User; totalAssets: number; totalDebt: number }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [savings, setSavings] = useState<SavingsRecord[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const historyQuery = query(collection(getFirebaseDb(), "users", user.uid, "monthlySnapshots"), orderBy("month", "asc"));
    return onSnapshot(historyQuery, (result) => setSnapshots(result.docs.map((item) => ({ id: item.id, ...item.data() }) as Snapshot)), () => setMessage("월별 기록을 불러오지 못했습니다."));
  }, [user.uid]);
  useEffect(() => {
    const savingsQuery = query(collection(getFirebaseDb(), "users", user.uid, "savings"), orderBy("month", "desc"), limit(6));
    return onSnapshot(savingsQuery, (result) => setSavings(result.docs.map((item) => item.data() as SavingsRecord).reverse()), () => setMessage("월별 저축 기록을 불러오지 못했습니다."));
  }, [user.uid]);
  const recent = snapshots.slice(-8);
  const chartMax = useMemo(() => Math.max(...recent.map((item) => Math.max(item.totalAssets, item.totalDebt)), 1), [recent]);
  const savingsMax = useMemo(() => Math.max(...savings.flatMap((item) => [item.targetAmount, item.savedAmount]), 1), [savings]);
  const previous = recent.length > 1 ? recent.at(-2) : null;
  const currentNet = totalAssets - totalDebt;
  const change = previous ? currentNet - previous.netAssets : null;

  async function saveCurrentMonth() {
    const now = new Date(); const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setSaving(true);
    try {
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "monthlySnapshots", month), { month, totalAssets, totalDebt, netAssets: currentNet, updatedAt: serverTimestamp() }, { merge: true });
      setMessage(`${month.replace("-", "년 ")}월 자산 기록을 저장했습니다.`);
    } catch { setMessage("월별 자산 기록을 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  return <section className="panel history-panel" id="asset-history">
    <div className="panel-heading"><div><p className="panel-kicker history-kicker">MONTHLY HISTORY</p><h2>월별 자산 변화</h2></div><button className="history-save" type="button" onClick={saveCurrentMonth} disabled={saving || totalAssets === 0}>{saving ? "저장 중..." : "이번 달 기록 저장"}</button></div>
    <div className="history-summary"><span>현재 순자산 <strong>{won.format(currentNet)}원</strong></span><span>직전 기록 대비 <strong className={change !== null && change < 0 ? "negative" : ""}>{change === null ? "기록 필요" : `${change >= 0 ? "+" : ""}${won.format(change)}원`}</strong></span></div>
    <div className="history-chart">
      {recent.map((item) => <div className="history-month" key={item.id}><div className="history-bars"><i className="asset-bar" style={{ height: `${Math.max((item.totalAssets / chartMax) * 100, 2)}%` }} title={`총자산 ${won.format(item.totalAssets)}원`} /><i className="debt-bar" style={{ height: `${Math.max((item.totalDebt / chartMax) * 100, item.totalDebt ? 2 : 0)}%` }} title={`부채 ${won.format(item.totalDebt)}원`} /></div><span>{item.month.slice(2).replace("-", ".")}</span><small>{Math.round(item.netAssets / 10_000).toLocaleString()}만</small></div>)}
      {recent.length === 0 && <div className="history-empty">이번 달 자산을 기록하면 변화 그래프가 시작됩니다.</div>}
    </div>
    <div className="history-legend"><span><i className="asset-dot" />총자산</span><span><i className="debt-dot" />부채</span><b>막대 아래 금액은 순자산(만원)</b></div>
    <div className="history-savings-section">
      <div className="monthly-savings-history-head"><strong>월별 저축 목표와 실제 저축</strong><span><i className="saving-target-dot" />목표 <i className="saving-actual-dot" />실제 저축</span></div>
      <div className="monthly-savings-chart">
        {savings.map((item) => <div className="monthly-saving-month" key={item.month}><div className="monthly-saving-bars"><i className="saving-target-bar" style={{ height: `${Math.max((item.targetAmount / savingsMax) * 100, 3)}%` }} title={`목표 ${won.format(item.targetAmount)}원`} /><i className="saving-actual-bar" style={{ height: `${Math.max((item.savedAmount / savingsMax) * 100, item.savedAmount ? 3 : 0)}%` }} title={`실제 ${won.format(item.savedAmount)}원`} /></div><span>{Number(item.month.slice(5))}월</span><small>{item.targetAmount ? `${Math.min((item.savedAmount / item.targetAmount) * 100, 999).toFixed(0)}%` : "-"}</small></div>)}
        {savings.length === 0 && <div className="monthly-savings-empty">월 저축 목표를 저장하면 이곳에 함께 표시됩니다.</div>}
      </div>
    </div>
    {message && <p className="asset-message">{message}</p>}
  </section>;
}
