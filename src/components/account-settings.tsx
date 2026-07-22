"use client";

import { useState } from "react";
import {
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

const USER_SUBCOLLECTIONS = [
  "assets",
  "loans",
  "cashflows",
  "monthlySnapshots",
  "savings",
  "insurance",
  "settings",
] as const;

type AccountSettingsProps = {
  user: User;
};

function getDeleteErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Google 본인 확인이 취소되었습니다. 다시 시도해 주세요.";
  }
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "비밀번호가 맞지 않습니다. 다시 확인해 주세요.";
  }
  if (code === "auth/requires-recent-login") {
    return "보안을 위해 다시 로그인한 뒤 삭제를 진행해 주세요.";
  }
  if (code === "auth/network-request-failed") {
    return "인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
  }

  return "계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

async function deleteCollectionDocuments(uid: string, collectionName: string) {
  const db = getFirebaseDb();
  const snapshot = await getDocs(collection(db, "users", uid, collectionName));
  const documents = snapshot.docs;

  for (let start = 0; start < documents.length; start += 450) {
    const batch = writeBatch(db);
    documents.slice(start, start + 450).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}

function makeJsonSafe(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(makeJsonSafe);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, makeJsonSafe(item)]));
  }
  return value;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [message, setMessage] = useState("");

  const hasGoogleProvider = user.providerData.some((provider) => provider.providerId === "google.com");
  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password");

  async function reauthenticate() {
    if (hasGoogleProvider) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await reauthenticateWithPopup(user, provider);
      return;
    }

    if (hasPasswordProvider && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return;
    }

    throw new Error("지원하는 로그인 방법을 확인할 수 없습니다.");
  }

  async function handleDeleteAccount() {
    setMessage("");

    if (confirmation.trim() !== "삭제") {
      setMessage("확인란에 ‘삭제’를 정확히 입력해 주세요.");
      return;
    }
    if (!hasGoogleProvider && hasPasswordProvider && !password) {
      setMessage("현재 계정의 비밀번호를 입력해 주세요.");
      return;
    }
    if (!window.confirm("계정과 저장된 모든 자산 데이터를 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await reauthenticate();

      for (const collectionName of USER_SUBCOLLECTIONS) {
        await deleteCollectionDocuments(user.uid, collectionName);
      }

      await deleteDoc(doc(getFirebaseDb(), "users", user.uid));
      await deleteUser(user);
      window.location.replace("/login?deleted=1");
    } catch (error) {
      setMessage(getDeleteErrorMessage(error));
      setIsDeleting(false);
    }
  }

  async function exportMyData() {
    setIsExporting(true);
    setExportMessage("");
    try {
      const db = getFirebaseDb();
      const userDocument = await getDoc(doc(db, "users", user.uid));
      const savedData: Record<string, unknown[]> = {};

      for (const collectionName of USER_SUBCOLLECTIONS) {
        const snapshot = await getDocs(collection(db, "users", user.uid, collectionName));
        savedData[collectionName] = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      }

      const backup = makeJsonSafe({
        service: "내 자산 포트폴리오",
        exportedAt: new Date().toISOString(),
        account: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime || null,
        },
        profile: userDocument.exists() ? userDocument.data() : null,
        data: savedData,
      });
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `내-자산-데이터-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      setExportMessage("내 자산 데이터를 백업 파일로 저장했습니다.");
    } catch {
      setExportMessage("데이터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="panel account-settings-panel" aria-labelledby="account-settings-title">
      <div className="account-settings-copy">
        <p className="panel-kicker">ACCOUNT</p>
        <h2 id="account-settings-title">계정 관리</h2>
        <p>서비스를 더 이상 사용하지 않는 경우 계정과 저장된 모든 자산 정보를 직접 삭제할 수 있습니다.</p>
      </div>

      {!isOpen ? (
        <div className="account-settings-controls">
          <button className="account-backup-button" type="button" onClick={exportMyData} disabled={isExporting}>
            <span aria-hidden="true">↓</span>{isExporting ? "백업 파일 만드는 중…" : "내 데이터 백업"}
          </button>
          <button className="account-delete-open" type="button" onClick={() => setIsOpen(true)}>
            계정 및 데이터 삭제
          </button>
          {exportMessage && <small role="status">{exportMessage}</small>}
        </div>
      ) : (
        <div className="account-delete-confirmation">
          <strong>계정 삭제 전 확인</strong>
          <p>자산, 대출, 고정수입·지출, 저축 기록과 프로필이 모두 영구 삭제되며 복구할 수 없습니다.</p>
          <label>
            계속하려면 <b>삭제</b> 입력
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="삭제"
              autoComplete="off"
              disabled={isDeleting}
            />
          </label>
          {!hasGoogleProvider && hasPasswordProvider && (
            <label>
              현재 비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                disabled={isDeleting}
              />
            </label>
          )}
          {hasGoogleProvider && <small>삭제 버튼을 누르면 Google 계정으로 본인 확인을 진행합니다.</small>}
          {message && <p className="account-delete-message" role="alert">{message}</p>}
          <div className="account-delete-actions">
            <button type="button" onClick={() => { setIsOpen(false); setConfirmation(""); setPassword(""); setMessage(""); }} disabled={isDeleting}>
              취소
            </button>
            <button className="account-delete-final" type="button" onClick={handleDeleteAccount} disabled={isDeleting || confirmation.trim() !== "삭제"}>
              {isDeleting ? "삭제 처리 중…" : "계정과 모든 데이터 영구 삭제"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
