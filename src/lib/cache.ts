import type { EmbedData } from "./twitter";

const cache = CacheService.getScriptCache();

/**
 * キャッシュを更新する
 * @param {EmbedData[]} items 検索結果
 */
export function updateCache(items: EmbedData[]) {
  const output = HtmlService.createTemplateFromFile("template");
  output.items = items;

  const content = output.evaluate().getContent();

  // 2時間キャッシュを保持する
  cache.put("content", content, 120 * 60);
}

/**
 * キャッシュしたXMLを取得する
 * @return {string} XML
 */
export function getCacheXml() {
  const content = cache.get("content");

  if (!content) return;

  return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.XML);
}
