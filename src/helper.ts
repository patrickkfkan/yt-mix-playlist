import { BASE_URL } from './Constants.js';

export function parseText(data: any): string {
  return (data?.simpleText || data?.runs?.map((a: any) => a?.text || '').join('')) || '';
}

export function sanitizeUrl(url: string) {
  return url ? new URL(url, BASE_URL).toString() : null;
}
