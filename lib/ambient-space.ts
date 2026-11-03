/** Cache actual text line rectangles, rather than blocking entire content columns. */
export function textClearances(ignoreSelector = "") {
  const boxes: { x: number; y: number; w: number; h: number; surface?: boolean }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent?.trim() || node.parentElement?.closest('script,style,[aria-hidden="true"]')) continue;
    if (ignoreSelector && node.parentElement?.closest(ignoreSelector)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) boxes.push({ x:r.left-2,y:r.top-2,w:r.width+4,h:r.height+4 });
    }
  }
  for (const el of document.querySelectorAll('img,input,textarea,button,.project-photo')) {
    const r=el.getBoundingClientRect();
    boxes.push({x:r.left,y:r.top,w:r.width,h:r.height,surface:true});
  }
  return boxes;
}
export function clearContent(ctx: CanvasRenderingContext2D, boxes: ReturnType<typeof textClearances>) {
  // Text is painted above the sky: its glyphs provide natural occlusion.
  // Keep text bounds for planet steering, but never punch rectangular holes around words.
  for (const b of boxes) if (b.surface) ctx.clearRect(b.x,b.y,b.w,b.h);
}
