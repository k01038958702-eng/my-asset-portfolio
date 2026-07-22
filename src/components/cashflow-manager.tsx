"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type StoredCashflow = { id: string; type: "income" | "expense"; name: string; amount: number };
const won = new Intl.NumberFormat("ko-KR");

export default function CashflowManager({ user, onCashflowsChange }: { user: User; onCashflowsChange: (items: StoredCashflow[]) => void }) {
  const [items, setItems] = useState<StoredCashflow[]>([]);
  const [type, setType] = useState<"income" | "expense">("income");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const cashflowQuery = query(collection(getFirebaseDb(), "users", user.uid, "cashflows"), orderBy("createdAt", "desc"));
    return onSnapshot(cashflowQuery, (snapshot) => {
      const nextItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StoredCashflow);
      setItems(nextItems);
      onCashflowsChange(nextItems);
    }, () => setMessage("고정수입·지출 정보를 불러오지 못했습니다."));
  }, [onCashflowsChange, user.uid]);

  const income = useMemo(() => items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0), [items]);
  const expense = useMemo(() => items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0), [items]);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!name.trim() || numericAmount <= 0) { setMessage("항목 이름과 0원보다 큰 월 금액을 입력해 주세요."); return; }
    setSaving(true);
    try {
      const values = { type, name: name.trim(), amount: numericAmount, updatedAt: serverTimestamp() };
      if (editingId) await updateDoc(doc(getFirebaseDb(), "users", user.uid, "cashflows", editingId), values);
      else await addDoc(collection(getFirebaseDb(), "users", user.uid, "cashflows"), { ...values, createdAt: serverTimestamp() });
      setName(""); setAmount(""); setEditingId(null); setMessage(editingId ? "월 고정 항목이 수정되었습니다." : "월 고정 항목이 저장되었습니다.");
    } catch { setMessage("정보를 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  async function removeItem(item: StoredCashflow) {
    if (!window.confirm(`${item.name} 항목을 삭제할까요?`)) return;
    await deleteDoc(doc(getFirebaseDb(), "users", user.uid, "cashflows", item.id));
  }

  function editItem(item: StoredCashflow) { setEditingId(item.id); setType(item.type); setName(item.name); setAmount(String(item.amount)); document.getElementById("cashflow-management")?.scrollIntoView({ behavior: "smooth" }); }
  function cancelEdit() { setEditingId(null); setName(""); setAmount(""); setMessage(""); }

  return (
    <section className="panel cashflow-panel" id="cashflow-management">
      <div className="panel-heading">
        <div><p className="panel-kicker cashflow-kicker">MONTHLY CASHFLOW</p><h2>고정수입·고정지출</h2></div>
        <div className="cashflow-balance"><span>월 고정 여유자금</span><strong className={income - expense < 0 ? "negative" : ""}>{won.format(income - expense)}원</strong></div>
      </div>
      <div className="cashflow-summary">
        <div><span>월 고정수입</span><strong>{won.format(income)}원</strong></div>
        <div><span>월 고정지출</span><strong>{won.format(expense)}원</strong></div>
        <div><span>고정지출 비율</span><strong>{income ? `${((expense / income) * 100).toFixed(1)}%` : "-"}</strong></div>
      </div>
      <form className="cashflow-form" onSubmit={addItem}>
        <label><span>구분</span><select value={type} onChange={(event) => setType(event.target.value as "income" | "expense")}><option value="income">고정수입</option><option value="expense">고정지출</option></select></label>
        <label><span>항목 이름</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={type === "income" ? "예: 월급" : "예: 월세"} /></label>
        <label><span>월 금액</span><input value={amount ? won.format(Number(amount)) : ""} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="금액 입력" /></label>
        <div className="form-actions"><button type="submit" disabled={saving}>{saving ? "저장 중..." : editingId ? "수정 저장" : "+ 항목 추가"}</button>{editingId && <button className="cancel-edit" type="button" onClick={cancelEdit}>취소</button>}</div>
      </form>
      {message && <p className="asset-message">{message}</p>}
      <div className="cashflow-lists">
        {(["income", "expense"] as const).map((kind) => <div className={`cashflow-list ${kind}`} key={kind}>
          <h3>{kind === "income" ? "고정수입" : "고정지출"}</h3>
          {items.filter((item) => item.type === kind).map((item) => <div className="cashflow-row" key={item.id}><span>{item.name}</span><strong>{won.format(item.amount)}원</strong><button className="edit-button" type="button" onClick={() => editItem(item)}>수정</button><button type="button" onClick={() => removeItem(item)}>삭제</button></div>)}
          {!items.some((item) => item.type === kind) && <p>등록한 항목이 없습니다.</p>}
        </div>)}
      </div>
      <p className="benchmark-note">매월 반복해서 들어오거나 나가는 금액을 등록하세요. 일회성 수입과 소비는 추후 별도 기능으로 관리할 예정입니다.</p>
    </section>
  );
}
