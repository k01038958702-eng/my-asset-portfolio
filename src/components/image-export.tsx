"use client";

import { useState } from "react";
import { createPortfolioImageBlob, downloadPortfolioBlob } from "@/lib/portfolio-image";

export default function ImageExport() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);

  async function saveImage() {
    setSaving(true); setMessage("");
    try {
      const blob = await createPortfolioImageBlob({ hideAmounts });
      downloadPortfolioBlob(blob);
      setMessage(hideAmounts ? "금액을 가린 PNG 이미지로 저장했습니다." : "선택한 세 개 영역을 PNG 이미지로 저장했습니다.");
    } catch { setMessage("이미지를 저장하지 못했습니다. 다시 시도해 주세요."); }
    finally {
      setSaving(false);
    }
  }

  return <div className="image-export-wrap">
    <button className="image-export-card" type="button" onClick={saveImage} disabled={saving}><span className="image-export-icon">↓</span><span><strong>{saving ? "이미지 만드는 중..." : "내 포트폴리오 저장"}</strong><small>PNG 이미지</small></span></button>
    <label className="image-privacy-option"><input type="checkbox" checked={hideAmounts} onChange={(event) => setHideAmounts(event.target.checked)} /><span>금액 가리고 저장</span></label>
    {message && <p className="image-export-message">{message}</p>}
  </div>;
}
