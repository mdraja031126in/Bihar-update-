import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makePng(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const chunkData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(chunkData), 0);
    return Buffer.concat([len, chunkData, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Draw professional UPDATE BIHAR icon
// Navy #0B1B3D background with amber/gold accents, white inner shield & bold letters
function renderIcon(x, y, width, height, isMaskable = false) {
  const nx = x / width;
  const ny = y / height;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Deep Navy Blue #0B1B3D -> #1D4ED8 gradient
  let r = Math.floor(11 + (29 - 11) * ny);
  let g = Math.floor(27 + (78 - 27) * ny);
  let b = Math.floor(61 + (216 - 61) * ny);
  let a = 255;

  // Outer border ring for 'any' icons
  if (!isMaskable && dist > 0.46 && dist < 0.49) {
    // Gold ring
    return [245, 158, 11, 255];
  }

  // Central shield/card badge
  const inCardX = nx >= 0.22 && nx <= 0.78;
  const inCardY = ny >= 0.20 && ny <= 0.80;
  if (inCardX && inCardY) {
    // Inner badge border
    const isCardBorder = (nx <= 0.24 || nx >= 0.76 || ny <= 0.22 || ny >= 0.78);
    if (isCardBorder) {
      return [245, 158, 11, 240]; // Gold border
    }

    // Inside card
    // Draw "UB" Monogram pattern:
    // "U" from nx: 0.30 to 0.46, ny: 0.32 to 0.62
    // Left stem of U
    const inULeft = nx >= 0.30 && nx <= 0.35 && ny >= 0.32 && ny <= 0.58;
    // Right stem of U
    const inURight = nx >= 0.41 && nx <= 0.46 && ny >= 0.32 && ny <= 0.58;
    // Bottom of U
    const inUBottom = nx >= 0.30 && nx <= 0.46 && ny >= 0.56 && ny <= 0.62;

    // "B" from nx: 0.54 to 0.70, ny: 0.32 to 0.62
    // Stem of B
    const inBStem = nx >= 0.52 && nx <= 0.57 && ny >= 0.32 && ny <= 0.62;
    // Top loop of B
    const inBTop = nx >= 0.56 && nx <= 0.68 && (ny >= 0.32 && ny <= 0.37 || ny >= 0.45 && ny <= 0.49 || (nx >= 0.64 && ny >= 0.32 && ny <= 0.49));
    // Bottom loop of B
    const inBBot = nx >= 0.56 && nx <= 0.70 && (ny >= 0.45 && ny <= 0.49 || ny >= 0.58 && ny <= 0.62 || (nx >= 0.66 && ny >= 0.47 && ny <= 0.62));

    if (inULeft || inURight || inUBottom || inBStem || inBTop || inBBot) {
      return [255, 255, 255, 255]; // Crisp White text
    }

    // Sub-banner "BIHAR" stripe
    if (ny >= 0.68 && ny <= 0.74 && nx >= 0.28 && nx <= 0.72) {
      return [245, 158, 11, 255]; // Gold ribbon
    }
  }

  return [r, g, b, a];
}

const pubDir = path.resolve(process.cwd(), 'public');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), makePng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), makePng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), makePng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), makePng(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('Successfully generated PWA and Apple Touch icons!');
