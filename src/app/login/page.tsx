"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type Mode = "login" | "signup";

function getGoogleSignInErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "unknown";

  switch (code) {
    case "auth/popup-blocked":
      return "브라우저가 Google 로그인 창을 차단했습니다. 주소창의 팝업 허용 설정을 확인해 주세요. (auth/popup-blocked)";
    case "auth/popup-closed-by-user":
      return "Google 로그인 창이 완료 전에 닫혔습니다. 다시 시도해 주세요. (auth/popup-closed-by-user)";
    case "auth/cancelled-popup-request":
      return "Google 로그인 요청이 중복되었습니다. 잠시 후 한 번만 눌러 주세요. (auth/cancelled-popup-request)";
    case "auth/unauthorized-domain":
      return "현재 사이트 주소가 Firebase 로그인 허용 목록에 없습니다. 운영자에게 알려 주세요. (auth/unauthorized-domain)";
    case "auth/network-request-failed":
      return "네트워크 연결 문제로 Google 로그인을 완료하지 못했습니다. 인터넷 연결을 확인해 주세요. (auth/network-request-failed)";
    case "auth/operation-not-supported-in-this-environment":
      return "현재 브라우저 환경에서는 Google 팝업 로그인을 사용할 수 없습니다. 일반 브라우저에서 다시 시도해 주세요. (auth/operation-not-supported-in-this-environment)";
    default:
      return `Google 로그인을 완료하지 못했습니다. 오류 코드: ${code}`;
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      if (currentUser) window.location.replace("/dashboard");
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFirebaseConfigured) {
      setMessage("Firebase 프로젝트 설정값을 연결하면 실제 로그인이 활성화됩니다.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const auth = getFirebaseAuth();
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("회원가입이 완료되었습니다. 이제 자산을 안전하게 저장할 수 있어요.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "/dashboard";
      }
    } catch {
      setMessage(mode === "signup" ? "회원가입을 완료하지 못했습니다. 이메일과 비밀번호를 확인해 주세요." : "이메일 또는 비밀번호를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("비밀번호를 재설정할 이메일을 먼저 입력해 주세요.");
      return;
    }
    if (!isFirebaseConfigured) {
      setMessage("Firebase 프로젝트 설정값을 먼저 연결해 주세요.");
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      setMessage("비밀번호 재설정 이메일을 보냈습니다.");
    } catch {
      setMessage("재설정 이메일을 보내지 못했습니다. 주소를 확인해 주세요.");
    }
  }

  async function signInWithGoogle() {
    if (!isFirebaseConfigured) {
      setMessage("Firebase 프로젝트 설정값을 먼저 연결해 주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getFirebaseAuth(), provider);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google sign-in failed", error);
      setMessage(getGoogleSignInErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Link className="brand auth-brand" href="/"><span className="brand-mark">M</span><span>내 자산 포트폴리오</span></Link>
        <div><p className="eyebrow">ONE ACCOUNT, EVERY DEVICE</p><h1>내 자산은<br />나만 볼 수 있게</h1><p>웹에서 기록한 자산을 나중에는 Flutter 앱에서도 같은 Firebase 계정으로 안전하게 이어볼 수 있습니다.</p></div>
        <ul><li>사용자별 자산 데이터 분리</li><li>웹·앱 공통 계정 기반</li><li>Firebase Authentication 적용</li></ul>
      </section>
      <section className="auth-card">
        <div className="auth-card-heading"><span>FIREBASE ACCOUNT</span><h2>{mode === "login" ? "로그인" : "새 계정 만들기"}</h2><p>이메일 주소로 간단하게 시작하세요.</p></div>
        {!isFirebaseConfigured && <div className="setup-message"><strong>현재는 로그인 화면 미리보기입니다.</strong><span>Firebase 웹 앱 설정값을 연결하면 실제 로그인이 활성화됩니다.</span></div>}
        {message && <div className="auth-message" role="status">{message}</div>}
        <button className="google-button" type="button" onClick={signInWithGoogle} disabled={loading}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.53l3.35-2.61Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"/></svg>
          Google 계정으로 계속하기
        </button>
        <div className="auth-divider"><span>또는 이메일로 계속</span></div>
        <form className="auth-form" onSubmit={submit}>
          <label>이메일<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="name@example.com" autoComplete="email" required /></label>
          <label>비밀번호<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="6자 이상 입력" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
          <button className="auth-primary" type="submit" disabled={loading}>{loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}</button>
          <button className="auth-secondary" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "새 계정 만들기" : "이미 계정이 있어요"}</button>
          {mode === "login" && <button className="reset-button" type="button" onClick={resetPassword}>비밀번호를 잊으셨나요?</button>}
        </form>
        <p className="auth-terms">계속하면 <Link href="/privacy">개인정보 처리 안내</Link>와 <Link href="/terms">서비스 이용약관</Link>을 확인하고 동의하는 것으로 간주됩니다.</p>
        <Link className="preview-link" href="/">← 공개 메인화면으로 돌아가기</Link>
      </section>
    </main>
  );
}
