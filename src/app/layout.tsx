import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asset.richchoi.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "내 자산 포트폴리오 | 자산과 부채를 한눈에",
    template: "%s | 내 자산 포트폴리오",
  },
  description: "현금, 예금, 주식, 부동산, 연금과 대출을 한곳에 기록하고 총자산·순자산·자산 비중을 확인하는 자산관리 서비스입니다.",
  keywords: ["자산관리", "자산 포트폴리오", "순자산", "자산 비중", "대출 관리", "저축 관리"],
  applicationName: "내 자산 포트폴리오",
  openGraph: {
    url: "/",
    title: "내 자산 포트폴리오 | 자산과 부채를 한눈에",
    description: "내 자산을 직접 기록하고 총자산, 순자산과 자산 비중을 한눈에 확인하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "내 자산 포트폴리오",
  },
  twitter: {
    card: "summary_large_image",
    title: "내 자산 포트폴리오",
    description: "내 자산을 직접 기록하고 총자산, 순자산과 자산 비중을 한눈에 확인하세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "naver-site-verification": "8f2ed5928a5e177c96d4625a0411f2b1a8f39984",
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
