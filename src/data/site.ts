// 全站 SEO 品牌名稱（統一格式：景點名稱 + 城市 + 旅遊指南）
// 用於 <title>、og:site_name、PWA name、頁尾品牌與子頁標題後綴，避免各處硬編碼不一致。
export const SITE_NAME = '十分瀑布（新北市平溪區）旅遊指南';
export const DOMAIN_NAME = 'shifenwaterfall.com';

/** 子頁標題附加站名，例如 withSiteName('隱私政策') → '十分瀑布（新北市平溪區）旅遊指南 | 隱私政策' */
export function withSiteName(suffix?: string): string {
  return suffix ? `${SITE_NAME} | ${suffix}` : SITE_NAME;
}
