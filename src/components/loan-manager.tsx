"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type StoredLoan = {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  remainingMonths?: number;
  monthlyPayment: number;
};

const won = new Intl.NumberFormat("ko-KR");

export default function LoanManager({ user, fixedIncome, onLoansChange }: { user: User; fixedIncome: number; onLoansChange: (loans: StoredLoan[]) => void }) {
  const [loans, setLoans] = useState<StoredLoan[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [remainingMonths, setRemainingMonths] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loansQuery = query(collection(getFirebaseDb(), "users", user.uid, "loans"), orderBy("createdAt", "desc"));
    return onSnapshot(loansQuery, (snapshot) => {
      const nextLoans = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StoredLoan);
      setLoans(nextLoans);
      onLoansChange(nextLoans);
    }, () => setMessage("대출 정보를 불러오지 못했습니다. Firestore 규칙을 확인해 주세요."));
  }, [onLoansChange, user.uid]);

  const totalBalance = useMemo(() => loans.reduce((sum, loan) => sum + loan.balance, 0), [loans]);
  const totalPayment = useMemo(() => loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0), [loans]);
  const paymentRatio = fixedIncome ? (totalPayment / fixedIncome) * 100 : 0;
  const burdenState = !fixedIncome ? "수입 입력 필요" : paymentRatio > 35 ? "부담 높음" : paymentRatio > 20 ? "점검 필요" : "관리 가능";
  const calculatedPayment = useMemo(() => {
    const principal = Number(balance);
    const months = Number(remainingMonths);
    const annualRate = Number(interestRate);
    if (!principal || !months || annualRate < 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / months);
    const factor = (1 + monthlyRate) ** months;
    return Math.round(principal * monthlyRate * factor / (factor - 1));
  }, [balance, interestRate, remainingMonths]);

  async function addLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericBalance = Number(balance);
    const numericRate = Number(interestRate);
    const numericMonths = Number(remainingMonths);
    if (!name.trim() || numericBalance <= 0 || numericRate < 0 || numericMonths <= 0 || calculatedPayment <= 0) {
      setMessage("대출명, 남은 금액, 금리와 상환기간을 올바르게 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const values = { name: name.trim(), balance: numericBalance, interestRate: numericRate, remainingMonths: numericMonths, monthlyPayment: calculatedPayment, updatedAt: serverTimestamp() };
      if (editingId) await updateDoc(doc(getFirebaseDb(), "users", user.uid, "loans", editingId), values);
      else await addDoc(collection(getFirebaseDb(), "users", user.uid, "loans"), { ...values, createdAt: serverTimestamp() });
      setName(""); setBalance(""); setInterestRate(""); setRemainingMonths("");
      setEditingId(null); setMessage(editingId ? "대출 정보가 수정되었습니다." : "대출 정보가 저장되었습니다.");
    } catch {
      setMessage("대출 정보를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function removeLoan(loan: StoredLoan) {
    if (!window.confirm(`${loan.name} 정보를 삭제할까요?`)) return;
    await deleteDoc(doc(getFirebaseDb(), "users", user.uid, "loans", loan.id));
  }

  function editLoan(loan: StoredLoan) { setEditingId(loan.id); setName(loan.name); setBalance(String(loan.balance)); setInterestRate(String(loan.interestRate)); setRemainingMonths(String(loan.remainingMonths || "")); document.getElementById("loan-management")?.scrollIntoView({ behavior: "smooth" }); }
  function cancelEdit() { setEditingId(null); setName(""); setBalance(""); setInterestRate(""); setRemainingMonths(""); setMessage(""); }

  return (
    <section className="panel debt-detail-panel" id="loan-management">
      <div className="panel-heading">
        <div><p className="panel-kicker">LIABILITIES</p><h2>내 대출 현황</h2></div>
        <div className="loan-totals"><span>총부채 <strong>{won.format(totalBalance)}원</strong></span><span>월 상환액 <strong>{won.format(totalPayment)}원</strong></span></div>
      </div>
      <div className={`loan-burden ${fixedIncome && paymentRatio <= 20 ? "good" : paymentRatio > 35 ? "warning" : ""}`}>
        <div><span>월 고정수입 대비 대출 상환액</span><strong>{fixedIncome ? `${paymentRatio.toFixed(1)}%` : "계산 전"}</strong></div>
        <div className="loan-burden-track"><i style={{ width: `${Math.min(paymentRatio, 100)}%` }} /></div>
        <div className="loan-burden-foot"><span>월 고정수입 {won.format(fixedIncome)}원</span><b>{burdenState}</b></div>
      </div>
      <form className="loan-form" onSubmit={addLoan}>
        <label><span>대출명</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 주택담보대출" /></label>
        <label><span>남은 금액</span><input value={balance ? won.format(Number(balance)) : ""} onChange={(event) => setBalance(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="원" /></label>
        <label><span>연 금리</span><input value={interestRate} onChange={(event) => setInterestRate(event.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="%" /></label>
        <label><span>남은 기간</span><input value={remainingMonths} onChange={(event) => setRemainingMonths(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="개월" /></label>
        <label><span>예상 월 상환액</span><output className="payment-output">{calculatedPayment ? `${won.format(calculatedPayment)}원` : "자동 계산"}</output></label>
        <div className="form-actions"><button type="submit" disabled={saving}>{saving ? "저장 중..." : editingId ? "수정 저장" : "+ 대출 추가"}</button>{editingId && <button className="cancel-edit" type="button" onClick={cancelEdit}>취소</button>}</div>
      </form>
      {message && <p className="asset-message">{message}</p>}
      <div className="debt-table">
        <div className="debt-row debt-header"><span>대출 종류</span><span>남은 금액</span><span>금리·기간</span><span>예상 월 상환액</span><span>관리</span></div>
        {loans.map((loan) => <div className="debt-row" key={loan.id}><strong>{loan.name}</strong><span>{won.format(loan.balance)}원</span><span>연 {loan.interestRate.toFixed(2)}%{loan.remainingMonths ? ` · ${loan.remainingMonths}개월` : ""}</span><span>{won.format(loan.monthlyPayment)}원</span><span className="row-actions"><button className="edit-button" type="button" onClick={() => editLoan(loan)}>수정</button><button type="button" onClick={() => removeLoan(loan)}>삭제</button></span></div>)}
        {loans.length === 0 && <div className="empty-assets">등록한 대출이 없습니다.</div>}
      </div>
      <p className="benchmark-note">예상 월 상환액은 원리금균등상환 방식으로 계산합니다. 부담 수준은 서비스 내부 생활금융 점검 기준이며 금융회사의 DSR 심사와 다릅니다.</p>
    </section>
  );
}
