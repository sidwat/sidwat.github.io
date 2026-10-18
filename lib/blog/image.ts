// Intrinsic size of a local image, read from its header (no dependency).
// Supports PNG, GIF, JPEG, WebP and SVG (width/height or viewBox). Anything else
// returns undefined and the caller warns.

import { readFileSync } from "node:fs";

export type ImageSize = { width: number; height: number };

function png(b: Buffer): ImageSize | undefined {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47 || b.toString("ascii", 12, 16) !== "IHDR") {
    return undefined;
  }
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gif(b: Buffer): ImageSize | undefined {
  if (b.length < 10 || b.toString("ascii", 0, 3) !== "GIF") return undefined;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function jpeg(b: Buffer): ImageSize | undefined {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return undefined;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = b.readUInt16BE(i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + length;
  }
  return undefined;
}

function webp(b: Buffer): ImageSize | undefined {
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    return undefined;
  }
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }
  return undefined;
}

function svg(b: Buffer): ImageSize | undefined {
  const text = b.toString("utf8", 0, Math.min(b.length, 4096));
  const tag = /<svg\b[^>]*>/i.exec(text)?.[0];
  if (!tag) return undefined;
  const attr = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(tag)?.[1];
  const num = (v: string | undefined) => (v && /^\s*[\d.]+(px)?\s*$/.test(v) ? parseFloat(v) : NaN);
  const w = num(attr("width"));
  const h = num(attr("height"));
  if (w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };
  const box = attr("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (box && box.length === 4 && box[2] > 0 && box[3] > 0) {
    return { width: Math.round(box[2]), height: Math.round(box[3]) };
  }
  return undefined;
}

export function probeImageSize(absPath: string): ImageSize | undefined {
  const b = readFileSync(absPath);
  const size = png(b) ?? gif(b) ?? jpeg(b) ?? webp(b) ?? svg(b);
  return size && size.width > 0 && size.height > 0 ? size : undefined;
}
