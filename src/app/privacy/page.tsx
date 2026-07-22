import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보 처리 안내",
  description: "내 자산 포트폴리오 서비스의 개인정보 처리 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>내 자산 포트폴리오</span></Link>
        <Link href="/">공개 메인으로</Link>
      </header>
      <main className="legal-main">
        <p className="legal-kicker">PRIVACY</p>
        <h1>개인정보 처리 안내</h1>
        <p className="legal-lead">내 자산 포트폴리오는 회원의 자산정보를 안전하게 관리하고 서비스 기능을 제공하는 데 필요한 범위에서 정보를 처리합니다.</p>
        <div className="legal-draft-notice"><strong>공개 전 확인 필요</strong><span>시행일은 정식 배포 전에 확정할 예정입니다.</span></div>

        <div className="legal-operator-info"><div><b>운영자</b><span>richchoi_studio</span></div><div><b>개인정보 보호 담당</b><span>richchoi_studio</span></div><div><b>문의 연락처</b><a href="mailto:whynot12s@naver.com">whynot12s@naver.com</a></div></div>

        <section><h2>1. 처리하는 정보</h2><ul><li><strong>계정정보:</strong> Firebase 사용자 식별값, 이메일, 표시 이름, 프로필 이미지, 로그인 제공업체 정보</li><li><strong>사용자가 직접 입력한 정보:</strong> 출생연도, 가구 기준, 자산·대출·고정수입·고정지출·월 저축 및 월별 자산 기록</li><li><strong>자동 생성 정보:</strong> 로그인 보안과 서비스 제공 과정에서 IP 주소, 사용자 환경 정보 등이 Firebase에 의해 처리될 수 있습니다.</li></ul></section>
        <section><h2>2. 처리 목적</h2><ul><li>회원 식별, 로그인과 계정 관리</li><li>사용자별 자산 데이터 저장·조회·수정·삭제</li><li>총자산, 순자산, 자산 비중, 부채 부담과 저축 현황 계산</li><li>서비스 보안 유지와 비정상 이용 방지</li></ul></section>
        <section><h2>3. 보유 기간과 삭제</h2><p>회원정보와 직접 입력한 데이터는 원칙적으로 계정이 유지되는 동안 보관합니다. 사용자가 대시보드의 ‘계정 및 데이터 삭제’를 실행하면 해당 계정과 서비스에 저장된 사용자 데이터를 삭제합니다. 법령에 따라 별도 보관이 필요한 정보가 생기는 경우에는 그 법정 기간 동안 분리하여 보관합니다.</p></section>
        <section><h2>4. 외부 서비스 이용과 국외 처리</h2><p>로그인과 데이터 저장을 위해 Google LLC의 Firebase Authentication과 Cloud Firestore를 이용합니다. Firebase Authentication은 미국 데이터센터에서 처리되며, Cloud Firestore는 설정된 Google Cloud 인프라에서 처리될 수 있습니다.</p><div className="legal-table"><div><b>처리업체</b><span>Google LLC (Firebase)</span></div><div><b>처리 목적</b><span>회원 인증, 계정 관리, 사용자 데이터 저장</span></div><div><b>처리 정보</b><span>계정정보, 사용자 입력 데이터, 보안 관련 접속정보</span></div><div><b>보유 기간</b><span>회원 탈퇴·데이터 삭제 시까지 또는 제공업체 정책에 따른 기간</span></div></div></section>
        <section><h2>5. 이용자의 권리</h2><p>회원은 서비스 화면에서 자신의 정보를 조회·수정·삭제할 수 있으며, 계정 관리에서 계정과 저장 데이터를 삭제할 수 있습니다. 개인정보 처리 관련 문의는 <a href="mailto:whynot12s@naver.com">whynot12s@naver.com</a>으로 접수할 수 있습니다.</p></section>
        <section><h2>6. 안전성 확보 조치</h2><ul><li>Firebase Authentication을 통한 사용자 인증</li><li>사용자 식별값 기준의 데이터 접근 분리</li><li>HTTPS 전송과 Firebase 저장 데이터 암호화 기능 이용</li><li>계정 삭제 시 사용자 데이터 삭제 기능 제공</li></ul></section>
        <section><h2>7. 안내문 변경</h2><p>서비스 기능이나 개인정보 처리 내용이 변경되면 이 페이지를 통해 변경 내용을 안내합니다.</p></section>
        <p className="legal-effective-date">시행일: 정식 공개 전 확정 예정</p>
      </main>
    </div>
  );
}
