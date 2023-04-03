import { sanitizeUrl } from '../helper.js';

export default class Thumbnail {
  url: string | null;
  width: number;
  height: number;

  constructor(data: any) {
    this.url = sanitizeUrl(data.url);
    this.width = data.width || 0;
    this.height = data.height || 0;
  }

  static parse(data: any): Thumbnail[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const resolved = data.reduce((r: Thumbnail[], d: any) => {
      if (d?.url) {
        r.push(new Thumbnail(d));
      }
      return r;
    }, []);

    resolved.sort((a: any, b: any) => (b.width - a.width));

    return resolved;
  }
}
