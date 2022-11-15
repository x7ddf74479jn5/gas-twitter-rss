/**
 * 検索ワードを取得
 * @returns {string[]} 検索ワード
 */
export function getSearchWords(): string[] {
  return getValuesFromSS(1);
}

/**
 * 除外するユーザーIDを取得
 * @returns {string[]} ユーザーID
 */
export function getIgnoreUsernames(): string[] {
  return getValuesFromSS(2);
}

/**
 * 除外するクライアントを取得
 * @returns {string[]} ユーザーID
 */
export function getIgnoreClients(): string[] {
  return getValuesFromSS(3);
}

/**
 * スプレッドシートから値を取得
 * @param {number} col 列番号
 * @returns {string[]} 範囲内の値
 */
export function getValuesFromSS(col: number): string[] {
  const ss = SpreadsheetApp.getActiveSheet();

  const lastRow = ss.getRange(1, col).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() - 1;

  const values = ss.getRange(2, col, lastRow).getValues();
  return values.flat();
}
