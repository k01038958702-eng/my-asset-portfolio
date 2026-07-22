import { toPng } from "html-to-image";

type PortfolioImageOptions = {
  hideAmounts?: boolean;
  siteUrl?: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function createPortfolioImageBlob({ hideAmounts = false, siteUrl }: PortfolioImageOptions = {}) {
  const allocation = document.querySelector<HTMLElement>(".allocation-panel");
  const rank = document.querySelector<HTMLElement>(".rank-card");
  const coach = document.querySelector<HTMLElement>("#financial-coach");
  if (!allocation || !rank || !coach) throw new Error("저장할 포트폴리오 카드를 찾지 못했습니다.");

  try {
    if (hideAmounts) {
      document.documentElement.classList.add("portfolio-export-private");
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    const captureOptions = { backgroundColor: "#f5f7fb", pixelRatio: 2, cacheBust: true };
    const [allocationUrl, rankUrl, coachUrl] = await Promise.all([
      toPng(allocation, captureOptions),
      toPng(rank, captureOptions),
      toPng(coach, captureOptions),
    ]);
    const [allocationImage, rankImage, coachImage] = await Promise.all([
      loadImage(allocationUrl),
      loadImage(rankUrl),
      loadImage(coachUrl),
    ]);

    const padding = 60;
    const headerHeight = 190;
    const gap = 36;
    const footerHeight = siteUrl ? 115 : 0;
    const canvas = document.createElement("canvas");
    const contentWidth = Math.max(allocationImage.width, rankImage.width, coachImage.width);
    canvas.width = contentWidth + padding * 2;
    canvas.height = headerHeight + allocationImage.height + rankImage.height + coachImage.height + gap * 2 + footerHeight + padding;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지 생성 기능을 사용할 수 없습니다.");

    context.fillStyle = "#f5f7fb";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const headerGradient = context.createLinearGradient(0, 0, canvas.width, headerHeight);
    headerGradient.addColorStop(0, "#315fca");
    headerGradient.addColorStop(.55, "#5367cd");
    headerGradient.addColorStop(1, "#7657c4");
    context.fillStyle = headerGradient;
    context.fillRect(0, 0, canvas.width, 154);
    context.fillStyle = "rgba(255,255,255,.76)";
    context.font = "700 20px Arial, sans-serif";
    context.fillText("MY ASSET PORTFOLIO", padding, 43);
    context.fillStyle = "#ffffff";
    context.font = "700 44px Arial, sans-serif";
    context.fillText("내 포트폴리오", padding, 96);
    context.fillStyle = "rgba(255,255,255,.78)";
    context.font = "19px Arial, sans-serif";
    context.fillText("자산 비중 · 내 연령대 자산 등급 · 자산 건강 코치", padding, 129);
    context.fillStyle = "rgba(255,255,255,.16)";
    context.beginPath();
    context.roundRect(canvas.width - padding - 185, 46, 185, 48, 24);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = "700 18px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(`${new Date().toLocaleDateString("ko-KR")} 기준`, canvas.width - padding - 92.5, 77);
    context.textAlign = "left";

    const centeredX = (image: HTMLImageElement) => padding + (contentWidth - image.width) / 2;
    let nextY = headerHeight;
    context.drawImage(allocationImage, centeredX(allocationImage), nextY);
    nextY += allocationImage.height + gap;
    context.drawImage(rankImage, centeredX(rankImage), nextY);
    nextY += rankImage.height + gap;
    context.drawImage(coachImage, centeredX(coachImage), nextY);

    if (siteUrl) {
      const footerTop = headerHeight + allocationImage.height + rankImage.height + coachImage.height + gap * 2 + 24;
      context.fillStyle = "#eef2fb";
      context.beginPath();
      context.roundRect(padding, footerTop, canvas.width - padding * 2, 82, 18);
      context.fill();
      context.fillStyle = "#3c4b68";
      context.font = "700 20px Arial, sans-serif";
      context.fillText("내 자산을 한눈에, 이제 내 자산을 직접 관리하세요!", padding + 24, footerTop + 32);
      context.fillStyle = "#5a68b8";
      context.font = "700 17px Arial, sans-serif";
      context.fillText(siteUrl, padding + 24, footerTop + 59);
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG 이미지를 만들지 못했습니다.");
    return blob;
  } finally {
    document.documentElement.classList.remove("portfolio-export-private");
  }
}

export function downloadPortfolioBlob(blob: Blob) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = `내-자산-요약-${new Date().toISOString().slice(0, 10)}.png`;
  anchor.href = downloadUrl;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}
