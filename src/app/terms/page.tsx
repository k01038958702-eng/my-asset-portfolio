import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "서비스 이용약관",
  description: "내 자산 포트폴리오 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link className="brand" href="/"><span className="brand-mark">M</span><span>내 자산 포트폴리오</span></Link>
        <Link href="/">공개 메인으로</Link>
      </header>
      <main className="legal-main">
        <p className="legal-kicker">TERMS</p>
        <h1>서비스 이용약관</h1>
        <p className="legal-lead">이 약관은 내 자산 포트폴리오가 제공하는 자산 기록·관리 기능의 이용 조건을 안내합니다.</p>
        <div className="legal-draft-notice"><strong>공개 전 확인 필요</strong><span>시행일은 정식 배포 전에 확정할 예정입니다.</span></div>

        <div className="legal-operator-info"><div><b>서비스 운영자</b><span>richchoi_studio</span></div><div><b>문의 연락처</b><a href="mailto:whynot12s@naver.com">whynot12s@naver.com</a></div></div>

        <section><h2>1. 서비스 목적</h2><p>서비스는 사용자가 직접 입력한 자산, 부채, 수입, 지출과 저축 기록을 한눈에 확인하고 관리할 수 있도록 계산·시각화·점검 정보를 제공합니다.</p></section>
        <section><h2>2. 계정 이용</h2><ul><li>회원은 본인이 사용 권한을 가진 로그인 계정을 이용해야 합니다.</li><li>회원은 계정 접근정보가 타인에게 노출되지 않도록 관리해야 합니다.</li><li>비정상적인 접근이나 서비스 방해 행위가 확인되면 이용이 제한될 수 있습니다.</li></ul></section>
        <section><h2>3. 회원이 입력하는 정보</h2><p>회원은 정확하고 적법한 정보를 입력해야 합니다. 서비스의 계산 결과는 회원이 입력한 값을 바탕으로 하므로, 입력 오류나 최신 정보 미반영에 따라 실제 자산 현황과 차이가 날 수 있습니다.</p></section>
        <section><h2>4. 금융정보 안내</h2><p>서비스가 제공하는 계산, 자산 건강 점검, 연령대 평균 비교와 기타 정보는 자산 관리를 돕기 위한 참고 자료입니다. 개별 금융상품의 매수·매도 권유, 투자자문, 세무·법률 자문을 제공하지 않습니다. 중요한 금융 결정은 필요한 경우 관련 자격을 갖춘 전문가와 확인해야 합니다.</p></section>
        <section><h2>5. 서비스 변경과 중단</h2><p>기능 개선, 점검, 장애, 외부 서비스 변경 등의 사유로 서비스의 전부 또는 일부가 변경되거나 일시 중단될 수 있습니다. 중요한 변경은 가능한 방법으로 사전에 안내합니다.</p></section>
        <section><h2>6. 금지되는 이용</h2><ul><li>타인의 계정 또는 정보를 무단으로 이용하는 행위</li><li>서비스의 정상 운영을 방해하거나 보안을 침해하는 행위</li><li>서비스 화면이나 데이터를 불법적인 목적으로 이용하는 행위</li><li>관련 법령과 공공질서에 위반되는 행위</li></ul></section>
        <section><h2>7. 탈퇴와 데이터 삭제</h2><p>회원은 대시보드의 계정 관리에서 계정과 저장 데이터를 직접 삭제할 수 있습니다. 삭제된 계정과 데이터는 복구할 수 없습니다.</p></section>
        <section><h2>8. 책임 범위</h2><p>천재지변, 통신 장애, 외부 플랫폼 장애 등 합리적으로 통제하기 어려운 사유로 서비스를 제공하지 못한 경우 책임이 제한될 수 있습니다. 회원의 입력 오류나 참고정보만을 근거로 한 판단에서 발생한 결과는 회원이 직접 확인해야 합니다.</p></section>
        <section><h2>9. 약관 변경</h2><p>서비스 내용이나 관련 제도가 변경되면 약관을 수정할 수 있으며, 변경된 내용과 시행일은 이 페이지를 통해 안내합니다.</p></section>
        <p className="legal-effective-date">시행일: 정식 공개 전 확정 예정</p>
      </main>
    </div>
  );
}
