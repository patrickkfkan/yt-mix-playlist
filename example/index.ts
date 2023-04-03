import { EOL } from 'os';
import ytmpl, { MixPlaylist, MixPlaylistItem } from '../dist/mjs/index.js';

function getMixPlaylist(videoId: string) {
  const options = { hl: 'en', gl: 'US' };
  return ytmpl(videoId, options);
}

function dumpPlaylistInfo(pl: MixPlaylist) {
  console.log('- Id: ' + pl.id);
  console.log('- Title: ' + pl.title);
  console.log('- Author: ' + pl.author);
  console.log('- Video Count: ' + pl.videoCount);
  console.log('- Share URL: ' + pl.url);
  console.log('- Thumbnails: ' + JSON.stringify(pl.thumbnails));
  console.log(`- Selected video Id: ${pl.getSelected().id} (index: ${pl.currentIndex})`);
  console.log('- Items:');
  console.log('--------------------');
  dumpPlaylistItems(pl.items);
}

function dumpPlaylistItems(items: MixPlaylistItem[], idOnly = false) {
  items.forEach((item, index) => {
    if (idOnly) {
      console.log(`${index}. ${item.id}`);
    }
    else {
      const startStr = `${index}. ${item.id}${item.selected ? '(selected)' : ''}: `;
      const indent = ' '.repeat(startStr.length);
      console.log(startStr + `${item.title} (duration: ${item.duration})`);
      if (item.author) {
        console.log(indent + `By: ${item.author.name} (channelId: ${item.author.channelId} - ${item.author.url})`);
      }
      console.log(indent + `Img: ${item.thumbnails[0]?.url} (${item.thumbnails[0]?.width} x ${item.thumbnails[0]?.height})`);
    }

  });
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(videoId: string) {
  console.log(`Obtaining Mix playlist for video ${videoId}...${EOL}`);
  let pl = await getMixPlaylist(videoId);
  if (!pl) {
    console.log('Failed to obtain playlist');
    return;
  }
  console.log('Obtained playlist:');
  dumpPlaylistInfo(pl);

  let i = 0, extracted = pl.items;
  while (i < 4) {
    console.log('');
    console.log('================================================');
    console.log(`Iteration #${i}: Selecting last item in playlist...`);
    pl = await pl.selectLast();
    if (!pl) {
      console.warn('`null` returned in previous operation. This is probably a bug. Test ended prematurely.');
      return;
    }
    console.log('');
    console.log('Playlist updated:');
    dumpPlaylistInfo(pl);

    extracted = extracted.concat(pl.getItemsAfterSelected());
    i++;
    await sleep(2000);
  }
  console.log('');
  console.log('===========================================');
  console.log('Selecting first item in current playlist...');
  pl = await pl.selectFirst();
  if (!pl) {
    console.warn('`null` returned in previous operation. This is probably a bug. Test ended prematurely.');
    return;
  }
  console.log('');
  console.log('Playlist updated:');
  dumpPlaylistInfo(pl);

  console.log('');
  console.log('');
  console.log('Video Ids fetched:');
  console.log('------------------');
  dumpPlaylistItems(extracted, true);
  console.log(EOL + 'Test completed');
}

main('XCcN-IoYIJA');
