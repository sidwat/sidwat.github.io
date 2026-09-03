"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/** Displayed width; the pair is 513x440, so height follows at 0.858. */
const WIDTH = 268;
const RATIO = 440 / 513;

/** How far he runs off the top and right edges, so he reads as peering in. */
const OFF_TOP = -34;
const OFF_RIGHT = -30;

const CLICKABLE = 'a, button, [role="button"], summary, input, select, textarea';

/**
 * The portrait watching from the top-right corner. He breaks into a smile
 * whenever the cursor is over something clickable.
 *
 * The two frames are registered to each other at encode time — same crop, same
 * scale — so the swap is a change of expression rather than a jump. Their
 * backdrops are identical too, which is what keeps the surrounding area from
 * flickering as they cross-fade.
 */
export default function PeekAvatar() {
  const [smiling, setSmiling] = useState(false);

  useEffect(() => {
    // Delegated rather than bound per element, so it keeps working as the page
    // changes. Anything clickable but non-semantic (a div with an onClick) will
    // not be seen — an argument for keeping the markup semantic, which it is.
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setSmiling(!!target?.closest?.(CLICKABLE));
    };
    // The pointer can leave the window still over a link, and no further
    // pointerover would arrive to undo the smile.
    const reset = () => setSmiling(false);

    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("blur", reset);
      document.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div
      // Above the nav: he is looking in at the page, not sitting inside its
      // chrome. Never interactive — he must not swallow clicks on the nav.
      //
      // lg and up, not md: below about 1024px the nav's links run far enough
      // right to end up behind him. They stay clickable, but a face covering
      // the navigation is not a trade worth making, so he simply stays away.
      className="pointer-events-none fixed z-50 hidden select-none lg:block"
      style={{ top: OFF_TOP, right: OFF_RIGHT }}
      aria-hidden="true"
    >
      <div
        className="peek-frame relative overflow-hidden"
        style={{ width: WIDTH, height: WIDTH * RATIO }}
      >
        <Image
          src="/media/peek-serious.jpg"
          alt=""
          width={513}
          height={440}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Image
          src="/media/peek-smile.jpg"
          alt=""
          width={513}
          height={440}
          priority
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            smiling ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
