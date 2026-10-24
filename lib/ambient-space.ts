/** Cache actual text line rectangles, rather than blocking entire content columns. */
export function textClearances() {
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent?.trim() || node.parentElement?.closest('script,style,[aria-hidden="true"]')) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) boxes.push({ x:r.left-10,y:r.top-8,w:r.width+20,h:r.height+16 });
    }
  }
  for (const el of document.querySelectorAll('img,input,textarea,button,.project-photo')) {
    const r=el.getBoundingClientRect();
    boxes.push({x:r.left-8,y:r.top-8,w:r.width+16,h:r.height+16});
  }
  return boxes;
}
export function clearContent(ctx: CanvasRenderingContext2D, boxes: ReturnType<typeof textClearances>) {
  for (const b of boxes) ctx.clearRect(b.x,b.y,b.w,b.h);
}
