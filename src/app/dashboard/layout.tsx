import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 자산 대시보드",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
