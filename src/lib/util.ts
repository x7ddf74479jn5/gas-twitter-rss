/**
 * 文字列を省略
 * @param {string} str 文字列
 * @param {number} len 文字列長
 * @return {string} 省略した文字列
 */
export function truncate(str: string, len: number): string {
  return str.length > len ? `${str.slice(0, len)}...` : str;
}

/**
 * URLパラメータを作成
 * @param {object} params パラメータ
 * @return {string} URLパラメータ
 */
export function createUrlParam(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}
