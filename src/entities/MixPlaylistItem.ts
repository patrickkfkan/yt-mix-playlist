import { parseText, sanitizeUrl } from '../helper.js';
import Author from './Author.js';
import Thumbnail from './Thumbnail.js';

export default class MixPlaylistItem {
  id: string;
  title: string;
  author: Author | null;
  url: string | null;
  selected: boolean;
  duration: string;
  thumbnails: Thumbnail[];

  constructor(data: any) {
    this.id = data.videoId;
    this.title = parseText(data.title);
    this.author = Author.parse(data);

    const endpointUrl = data.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;
    this.url = sanitizeUrl(endpointUrl);

    this.selected = !!data.selected;
    this.duration = parseText(data.lengthText);
    this.thumbnails = Thumbnail.parse(data.thumbnail?.thumbnails);
  }

  static parse(data: any): MixPlaylistItem | null {
    const videoData = data?.playlistPanelVideoRenderer;
    return videoData?.videoId ? new MixPlaylistItem(videoData) : null;
  }
}
