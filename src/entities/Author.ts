import { parseText, sanitizeUrl } from '../helper.js';

export default class Author {
  name: string;
  channelId: string | null;
  url: string | null;

  constructor(data: any) {
    this.name = parseText(data.shortBylineText);

    const endpoint = Author.#getEndpoint(data);
    this.channelId = endpoint?.browseId || null;
    this.url = sanitizeUrl(endpoint.canonicalBaseUrl);
  }

  static parse(data: any): Author | null {
    if (!this.#getEndpoint(data)) {
      return null;
    }

    return new Author(data);
  }

  static #getEndpoint(data: any) {
    return data?.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint || null;
  }
}
