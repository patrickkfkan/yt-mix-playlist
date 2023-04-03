import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';
import Context from '../Context.js';
import { getWatchPageResults } from '../fetch.js';
import MixPlaylistBasicInfo from './MixPlaylistBasicInfo.js';
import MixPlaylistEndpointItem from './MixPlaylistEndpointItem.js';
import MixPlaylistItem from './MixPlaylistItem.js';
import Thumbnail from './Thumbnail.js';

export default class MixPlaylist extends MixPlaylistBasicInfo {
  currentIndex: number;
  items: MixPlaylistItem[];
  videoCount: string;
  thumbnails: Thumbnail[];
  #context: Context;

  constructor(data: any, context: Context) {
    if (!context?.endpointItem) {
      throw Error('Context missing or invalid. Make sure you are not calling the constructor directly.');
    }
    super(data);

    this.title = context.endpointItem.title;
    this.videoCount = context.endpointItem.videoCount;
    this.thumbnails = context.endpointItem.thumbnails;
    this.currentIndex = data.currentIndex;
    this.items = data.contents?.reduce((r: MixPlaylistItem[], d: any) => {
      const parsed = MixPlaylistItem.parse(d);
      if (parsed) {
        r.push(parsed);
      }
      return r;
    }, []);
    this.#context = context;
  }

  static #parse(data: any, context: Context): MixPlaylist | null {
    if (!data?.playlistId) {
      return null;
    }

    return new MixPlaylist(data, context);
  }

  static async fetch(videoId: string, options?: { gl?: string, hl?: string }): Promise<MixPlaylist | null> {
    const context: Context = {
      endpointItem: null,
      options: {
        gl: options?.gl,
        hl: options?.hl
      },
      fetchFn: fetchCookie(nodeFetch)
    };

    const endpointItem = await MixPlaylistEndpointItem.fetch(videoId, context);
    if (endpointItem) {
      context.endpointItem = endpointItem;
      return this.#doFetch(videoId, context);
    }

    return null;
  }

  static async #doFetch(videoId: string, context: Context): Promise<MixPlaylist | null> {
    const results = await getWatchPageResults(videoId, context);
    const playlistData = results?.contents?.twoColumnWatchNextResults?.playlist?.playlist;
    return this.#parse(playlistData, context) || null;
  }

  async select(videoId: string): Promise<MixPlaylist | null>;
  async select(index: number): Promise<MixPlaylist | null>;
  async select(target: string | number): Promise<MixPlaylist | null> {
    const videoId = typeof target === 'string' ? target : this.items[target].id;
    return MixPlaylist.#doFetch(videoId, this.#context);
  }

  async selectFirst(): Promise<MixPlaylist | null> {
    return this.select(0);
  }

  async selectLast(): Promise<MixPlaylist | null> {
    return this.select(this.items.length - 1);
  }

  getSelected(): MixPlaylistItem {
    return this.items[this.currentIndex];
  }

  getItemsBeforeSelected(): MixPlaylistItem[] {
    return this.items.slice(0, this.currentIndex);
  }

  getItemsAfterSelected(): MixPlaylistItem[] {
    return this.items.slice(this.currentIndex + 1);
  }
}
