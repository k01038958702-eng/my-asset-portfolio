"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type StoredProfile = { birthYear: number; comparisonBasis: "individual" | "household"; householdSize: number };

export default function ProfileManager({ user, onProfileChange }: { user: User; onProfileChange: (profile: StoredProfile | null) => void }) {
  const [birthYear, setBirthYear] = useState("");
  const [comparisonBasis, setComparisonBasis] = useState<"individual" | "household">("individual");
  const [householdSize, setHouseholdSize] = useState("1");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => onSnapshot(doc(getFirebaseDb(), "users", user.uid), (snapshot) => {
    if (!snapshot.exists()) { onProfileChange(null); return; }
    const data = snapshot.data();
    if (!data.birthYear) { onProfileChange(null); return; }
    const profile = { birthYear: Number(data.birthYear), comparisonBasis: data.comparisonBasis === "household" ? "household" as const : "individual" as const, householdSize: Number(data.householdSize || 1) };
    setBirthYear(String(profile.birthYear)); setComparisonBasis(profile.comparisonBasis); setHouseholdSize(String(profile.householdSize)); onProfileChange(profile);
  }), [onProfileChange, user.uid]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const year = Number(birthYear); const size = Number(householdSize); const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear || size < 1 || size > 20) { setMessage("출생연도와 가구원 수를 확인해 주세요."); return; }
    setSaving(true);
    try {
      await setDoc(doc(getFirebaseDb(), "users", user.uid), { birthYear: year, comparisonBasis, householdSize: size, email: user.email, displayName: user.displayName, updatedAt: serverTimestamp() }, { merge: true });
      setMessage("기본정보가 저장되었습니다.");
    } catch { setMessage("기본정보를 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  return <section className="panel profile-panel" id="profile-management">
    <div className="panel-heading"><div><p className="panel-kicker profile-kicker">MY PROFILE</p><h2>연령대 비교 기준</h2></div><span className="static-label">자산 순위 분석 준비</span></div>
    <form className="profile-form" onSubmit={saveProfile}>
      <label><span>출생연도</span><input value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} inputMode="numeric" placeholder="예: 1985" /></label>
      <label><span>비교 기준</span><select value={comparisonBasis} onChange={(e) => setComparisonBasis(e.target.value as "individual" | "household")}><option value="individual">개인 기준</option><option value="household">가구 기준</option></select></label>
      <label><span>가구원 수</span><input value={householdSize} onChange={(e) => setHouseholdSize(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} inputMode="numeric" disabled={comparisonBasis === "individual"} /></label>
      <button type="submit" disabled={saving}>{saving ? "저장 중..." : "기본정보 저장"}</button>
    </form>
    {message && <p className="asset-message">{message}</p>}
    <p className="benchmark-note">출생연도는 연령대 구분에만 사용합니다. 자산 비교 결과는 개인 기준과 가구 기준이 서로 다르므로 반드시 구분해 계산합니다.</p>
  </section>;
}
