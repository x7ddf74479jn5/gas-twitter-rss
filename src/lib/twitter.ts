import type { MediaObjectV2, TweetV2, TweetV2LookupResult } from "twitter-api-v2";

import { useProperty } from "./property";
import { getIgnoreClients, getIgnoreUsernames } from "./sheet";
import { createUrlParam, truncate } from "./util";

const property = useProperty();
const token = property.get("twitterToken");
const ignoreUsernames = getIgnoreUsernames();
const ignoreClients = getIgnoreClients();

/**
 * ツイートを検索
 * @param {string[]} keywords 検索ワード
 * @returns {EmbedData[]} 検索結果の配列
 */
export function fetchSearchResults(keywords: string[]) {
  const requests = createRequests(keywords);
  const responses = UrlFetchApp.fetchAll(requests);

  const results = responses.map((res, i) => {
    const json: TweetV2LookupResult = JSON.parse(res.getContentText());
    return createEmbedData(keywords[i], json);
  });

  return results.filter((v): v is EmbedData[] => !!v).flat();
}

type Request = {
  url: string;
  headers: Record<string, string>;
};

/**
 * 検索ワードからリクエストを作成する
 * @see https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
 * @param {string[]} keywords 検索ワード
 * @returns {Request[]} リクエスト
 */
export function createRequests(keywords: string[]): Request[] {
  return keywords.map((keyword) => {
    const urlParams = createUrlParam({
      query: encodeURIComponent(`${keyword} -is:retweet -is:reply`),
      max_results: "10",
      expansions: "author_id,attachments.media_keys",
      "tweet.fields": "created_at,id,source,text,entities",
      "user.fields": "name,username",
      "media.fields": "url",
    });

    return {
      url: `https://api.twitter.com/2/tweets/search/recent?${urlParams}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  });
}

export type EmbedData = {
  title: string;
  name: string;
  username: string;
  text: string;
  url: string;
  mediaUrl: string;
  date: string;
};

/**
 * 埋め込み用データを作成
 * @param {string} keyword 検索ワード
 * @param {TweetV2LookupResult} json TweetV2LookupResult
 * @returns {EmbedData[] | null} 埋め込み用データ
 */
export function createEmbedData(keyword: string, json: TweetV2LookupResult): EmbedData[] | null {
  const data = json?.data;
  const users = json?.includes?.users;
  const media = json?.includes?.media;

  // 検索結果が無い
  if (!data || !users) {
    return null;
  }

  const results = data
    .map((tweet) => {
      const author = users.find(({ id }) => id === tweet.author_id);

      // 除外対象ならnullを返す
      if (tweet.source && author?.username) {
        if (ignoreClients.includes(tweet?.source) || ignoreUsernames.includes(author?.username)) {
          return null;
        }
      }

      // 添付画像を取得
      const mediaUrl = media && getMediaUrl(tweet, media);

      const url = `https://twitter.com/${author?.username}/status/${tweet.id}`;

      // 投稿日時をRSS用のフォーマットに直す
      const date = tweet.created_at
        ? Utilities.formatDate(new Date(tweet.created_at), "Asia/Tokyo", "E, d MMM YYYY HH:mm:ss Z")
        : "";

      return {
        title: `【${keyword}】${truncate(tweet.text, 20)}`,
        name: author?.name ?? "",
        username: author?.username ?? "",
        text: tweet.text ?? "",
        url,
        mediaUrl: mediaUrl ?? "",
        date,
      };
    })
    .filter((v): v is NonNullable<EmbedData> => !!v);

  console.log(`${keyword} : ${results.length}`);

  return results;
}

/**
 * 画像URLを取得
 * @param {TweetV2} tweet ツイートフィールド
 * @param {MediaObjectV2[]} media メディアフィールド
 * @return {string | undefined} 画像URL
 */
export function getMediaUrl(tweet: TweetV2, media: MediaObjectV2[]) {
  const attachments = tweet?.attachments;

  // 添付メディアが存在する
  if (attachments && media) {
    const mediaKey = attachments.media_keys?.[0];
    return media.find(({ media_key }) => media_key === mediaKey)?.url;
  }

  // リンク先のOGP画像を返す
  return tweet.entities?.urls?.[0].images?.[0].url;
}
