"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

type MonthlySavingsRecord = { month: string; targetAmount: number; savedAmount: number };
const won = new Intl.NumberFormat("ko-KR");

export default function MonthlySavings({ user, monthlySurplus }: { user: User; monthlySurplus: number }) {
  const month = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthLabel = `${Number(month.slice(5))}월`;
  const [record, setRecord] = useState<MonthlySavingsRecord | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => onSnapshot(doc(getFirebaseDb(), "users", user.uid, "savings", month), (snapshot) => {
    if (!snapshot.exists()) { setRecord(null); return; }
    const saved = snapshot.data() as MonthlySavingsRecord;
    setRecord(saved); setTargetAmount(String(saved.targetAmount)); setSavedAmount(String(saved.savedAmount));
  }, () => setMessage("저축 기록을 불러오지 못했습니다.")), [month, user.uid]);

  const target = Number(targetAmount) || 0;
  const saved = Number(savedAmount) || 0;
  const progress = target ? Math.min((saved / target) * 100, 100) : 0;
  const remaining = Math.max(target - saved, 0);
  const availableSurplus = Math.max(monthlySurplus, 0);
  const feasibility = !target ? "목표 설정 전" : availableSurplus >= target ? "현재 현금흐름 범위" : `월 여유자금보다 ${won.format(target - availableSurplus)}원 높음`;

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (target <= 0 || saved < 0) { setMessage("월 저축 목표를 올바르게 입력해 주세요."); return; }
    setSaving(true); setMessage("");
    try {
      await setDoc(doc(getFirebaseDb(), "users", user.uid, "savings", month), { month, targetAmount: target, savedAmount: saved, updatedAt: serverTimestamp() });
      setMessage(`${monthLabel} 저축 계획을 저장했습니다.`);
    } catch { setMessage("저축 계획을 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  return <section className="panel monthly-savings-panel" id="monthly-savings">
    <div className="panel-heading"><div><p className="panel-kicker monthly-savings-kicker">MONTHLY SAVINGS</p><h2>{monthLabel} 저축 목표</h2></div><span className={`monthly-savings-state ${progress >= 100 ? "done" : ""}`}>{record ? `${progress.toFixed(0)}% 달성` : "목표 설정"}</span></div>
    <div className="monthly-savings-overview">
      <div><span>이번 달 목표</span><strong>{won.format(target)}원</strong></div><div><span>지금까지 저축</span><strong>{won.format(saved)}원</strong></div><div><span>목표까지</span><strong>{won.format(remaining)}원</strong></div><div><span>연간 환산 목표</span><strong>{won.format(target * 12)}원</strong></div>
    </div>
    <div className="monthly-savings-progress"><i style={{ width: `${progress}%` }} /></div>
    <div className="monthly-savings-note"><span>고정수입−고정지출: <strong>{won.format(monthlySurplus)}원</strong></span><b>{feasibility}</b></div>
    <form className="monthly-savings-form" onSubmit={saveRecord}>
      <label><span>매월 얼마 저축할까요?</span><input value={targetAmount ? won.format(Number(targetAmount)) : ""} onChange={(event) => setTargetAmount(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="월 저축 목표" /></label>
      <label><span>이번 달 실제 저축액</span><input value={savedAmount ? won.format(Number(savedAmount)) : ""} onChange={(event) => setSavedAmount(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="현재까지 저축한 금액" /></label>
      <button type="submit" disabled={saving}>{saving ? "저장 중..." : record ? "이번 달 기록 수정" : "이번 달 저축 저장"}</button>
    </form>
    {message && <p className="asset-message">{message}</p>}
    <p className="benchmark-note">월별 목표와 실제 저축액은 직접 입력한 금액을 기준으로 기록됩니다.</p>
  </section>;
}
