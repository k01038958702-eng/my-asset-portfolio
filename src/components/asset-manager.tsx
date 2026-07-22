"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type StoredAsset = {
  id: string;
  name: string;
  category: string;
  amount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const categories = ["현금", "예금·적금", "국내주식", "해외주식·ETF", "코인", "부동산", "전월세 보증금", "연금·퇴직계좌", "자동차", "기타 자산"];
const colors: Record<string, string> = {
  "현금": "#1cb790",
  "예금·적금": "#4174f6",
  "국내주식": "#7c5ce7",
  "해외주식·ETF": "#8b62e8",
  "코인": "#f2a63b",
  "부동산": "#d66a55",
  "전월세 보증금": "#d89162",
  "연금·퇴직계좌": "#4c91b8",
  "자동차": "#7185a3",
  "기타 자산": "#9aa5b6",
};

const won = new Intl.NumberFormat("ko-KR");

function getAssetUpdateInfo(asset: StoredAsset) {
  const timestamp = asset.updatedAt || asset.createdAt;
  if (!timestamp?.toDate) return { label: "수정일 미확인", stale: true };
  const date = timestamp.toDate();
  const daysSinceUpdate = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return { label: date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }), stale: daysSinceUpdate >= 90 };
}

export default function AssetManager({ user, onAssetsChange }: { user: User; onAssetsChange: (assets: StoredAsset[]) => void }) {
  const [assets, setAssets] = useState<StoredAsset[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("자산을 처음 등록해 보세요.");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const assetsQuery = query(
      collection(getFirebaseDb(), "users", user.uid, "assets"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      assetsQuery,
      (snapshot) => {
        const nextAssets = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as StoredAsset);
        setAssets(nextAssets);
        onAssetsChange(nextAssets);
        setMessage("");
      },
      () => setMessage("자산 정보를 불러오지 못했습니다. Firestore 규칙을 확인해 주세요."),
    );
  }, [onAssetsChange, user.uid]);

  const total = useMemo(() => assets.reduce((sum, asset) => sum + asset.amount, 0), [assets]);

  async function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount.replaceAll(",", ""));
    if (!name.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("자산 이름과 0원보다 큰 금액을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const values = { name: name.trim(), category, amount: numericAmount, updatedAt: serverTimestamp() };
      if (editingId) await updateDoc(doc(getFirebaseDb(), "users", user.uid, "assets", editingId), values);
      else await addDoc(collection(getFirebaseDb(), "users", user.uid, "assets"), { ...values, createdAt: serverTimestamp() });
      setName("");
      setAmount("");
      setEditingId(null);
      setMessage(editingId ? "자산 정보가 수정되었습니다." : "자산이 안전하게 저장되었습니다.");
    } catch {
      setMessage("자산을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAsset(asset: StoredAsset) {
    if (!window.confirm(`${asset.name} 자산을 삭제할까요?`)) return;
    await deleteDoc(doc(getFirebaseDb(), "users", user.uid, "assets", asset.id));
  }

  function editAsset(asset: StoredAsset) {
    setEditingId(asset.id); setName(asset.name); setCategory(asset.category); setAmount(String(asset.amount));
    document.getElementById("asset-management")?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() { setEditingId(null); setName(""); setAmount(""); setMessage(""); }

  const categoryGuide: Record<string, { amountLabel: string; placeholder: string; title: string; detail: string; loanLink?: string }> = {
    "부동산": { amountLabel: "현재 시가", placeholder: "주택의 현재 시가 전체", title: "부동산은 대출을 빼지 않은 현재 시가 전체를 입력하세요.", detail: "예: 집값 5억원·주택담보대출 2억원이면 부동산 자산은 5억원으로 등록합니다.", loanLink: "주택담보대출 별도 등록 ↓" },
    "전월세 보증금": { amountLabel: "반환받을 보증금", placeholder: "계약서상 보증금 전체", title: "계약 종료 시 반환받을 보증금 전체를 입력하세요.", detail: "전세자금대출이 있다면 보증금에서 빼지 말고 대출 현황에 별도로 등록합니다.", loanLink: "전세자금대출 별도 등록 ↓" },
    "연금·퇴직계좌": { amountLabel: "현재 계좌 잔액", placeholder: "현재 적립된 금액", title: "현재 확인 가능한 계좌 잔액만 입력하세요.", detail: "연금저축·IRP·퇴직연금의 현재 적립액 기준이며, 국민연금의 미래 예상 수령액은 포함하지 않습니다." },
    "자동차": { amountLabel: "현재 중고 시세", placeholder: "현재 판매 가능한 예상 금액", title: "구입 가격이 아닌 현재 중고 시세를 입력하세요.", detail: "차량 할부나 자동차 대출 잔액이 있다면 대출 현황에 별도로 등록합니다.", loanLink: "자동차 대출 별도 등록 ↓" },
  };
  const activeGuide = categoryGuide[category];

  return (
    <section className="panel real-assets-panel" id="asset-management">
      <div className="panel-heading">
        <div><p className="panel-kicker">MY REAL ASSETS</p><h2>실제 자산 등록</h2></div>
        <div className="saved-total"><span>저장된 총자산</span><strong>{won.format(total)}원</strong></div>
      </div>
      <form className="asset-form" onSubmit={addAsset}>
        <label><span>분류</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>자산 이름</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 생활비 통장" /></label>
        <label><span>{activeGuide?.amountLabel || "현재 금액"}</span><input value={amount ? won.format(Number(amount)) : ""} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder={activeGuide?.placeholder || "금액 입력"} /></label>
        <div className="form-actions"><button type="submit" disabled={saving}>{saving ? "저장 중..." : editingId ? "수정 저장" : "+ 자산 추가"}</button>{editingId && <button className="cancel-edit" type="button" onClick={cancelEdit}>취소</button>}</div>
      </form>
      {activeGuide && <div className="real-estate-guide"><span><strong>{activeGuide.title}</strong><small>{activeGuide.detail}</small></span>{activeGuide.loanLink && <a href="#loan-management">{activeGuide.loanLink}</a>}</div>}
      {message && <p className="asset-message">{message}</p>}
      <div className="saved-assets">
        {assets.length === 0 && <div className="empty-assets">아직 등록한 자산이 없습니다.</div>}
        {assets.map((asset) => {
          const updateInfo = getAssetUpdateInfo(asset);
          return <div className="saved-asset-row" key={asset.id}>
            <i style={{ backgroundColor: colors[asset.category] || colors["기타 자산"] }} />
            <span><strong>{asset.name}</strong><small>{asset.category} · {updateInfo.label}{updateInfo.stale && <b>업데이트 필요</b>}</small></span>
            <b>{won.format(asset.amount)}원</b>
            <button className="edit-button" type="button" onClick={() => editAsset(asset)}>수정</button>
            <button type="button" onClick={() => removeAsset(asset)}>삭제</button>
          </div>;
        })}
      </div>
      <p className="real-data-note">이 영역의 데이터는 로그인한 본인의 Firestore 계정에만 저장됩니다. 부동산·주식 등 가격이 변하는 자산은 현재 금액을 직접 최신 상태로 수정해 주세요.</p>
    </section>
  );
}
