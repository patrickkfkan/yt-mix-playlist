import Context from '../Context.js';
import { getContinuationResults, getWatchPageResults } from '../fetch.js';
import { parseText } from '../helper.js';
import MixPlaylistBasicInfo from './MixPlaylistBasicInfo.js';
import Thumbnail from './Thumbnail.js';

const MAX_CONTINUATION_RUNS = 5;

export default class MixPlaylistEndpointItem extends MixPlaylistBasicInfo {
  videoCount: string;
  thumbnails: Thumbnail[];

  constructor(data: any) {
    super(data);

    this.videoCount = parseText(data.videoCountText);
    this.thumbnails = Thumbnail.parse(data.thumbnail?.thumbnails);
  }

  static #parse(data: any): MixPlaylistEndpointItem | null {
    if (!data?.playlistId) {
      return null;
    }

    return new MixPlaylistEndpointItem(data);
  }

  static async fetch(videoId: string, context: Context): Promise<MixPlaylistEndpointItem | null> {
    const results = await getWatchPageResults(videoId, context);
    const parsed = this.#findInResults(results);

    if (typeof parsed === 'string') {
      /**
       * Continuation:
       * Sometimes, the target is not among the items initially shown on the watch page.
       * You would have to scroll further down the page to obtain more items which may then
       * contain the target. Programatically, we use the continuation token to fetch
       * these additional items.
       */
      return await this.#fetchByContinuation(context, parsed);
    }

    return parsed;
  }

  static #findInResults(data: any, isContinuation = false): MixPlaylistEndpointItem | string | null {
    const items = isContinuation ?
      data?.onResponseReceivedEndpoints?.[0]?.appendContinuationItemsAction?.continuationItems :
      data?.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results;

    if (!items) {
      return null;
    }

    if (Array.isArray(items)) {
      const itemData = items.find((item) => item?.compactRadioRenderer?.playlistId)?.compactRadioRenderer;

      if (itemData) {
        return this.#parse(itemData);
      }

      const token = items[items.length - 1]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      if (token) {
        return token;
      }
    }

    return null;
  }

  static async #fetchByContinuation(context: Context, token: string, rt = MAX_CONTINUATION_RUNS): Promise<MixPlaylistEndpointItem | null> {
    if (rt === 0) {
      /**
       * Give up after MAX_CONTINUATION_RUNS. It is possible there is no mix playlist for the video
       * after all and it would make no sense to keep on going forever.
       */
      return null;
    }
    const contents = await getContinuationResults(context, token);
    const parsed = this.#findInResults(contents, true);

    if (typeof parsed === 'string') {
      // Got another continuation token - dig deeper.
      return this.#fetchByContinuation(context, parsed, rt - 1);
    }

    return parsed;
  }
}
