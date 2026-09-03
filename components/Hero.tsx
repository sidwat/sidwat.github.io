"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { site } from "@/lib/site";

/**
 * Degrees of tilt at the edge of the frame. Small on purpose — the portrait
 * should read as a real person catching the light, not as a rotating card.
 */
const MAX_TILT = 6;

/** HTMLMediaElement.HAVE_FUTURE_DATA — the readyState `canplay` corresponds to. */
const HAVE_FUTURE_DATA = 3;

/**
 * Subscribes to a media query without syncing it into state on mount, which
 * would mean rendering once against a guess and again against the truth.
 */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  // Touch devices have no hover, so the wave needs a tap instead.
  const canHover = useMediaQuery("(hover: hover)");
  const videoRef = useRef<HTMLVideoElement>(null);
  // The photo is the base layer and the video fades in over it once it can
  // actually play. A <video> poster is not a usable fallback: when the source
  // fails to load the browser drops the poster and paints an empty box.
  const [videoReady, setVideoReady] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 140, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 140, damping: 18 });
  const rotateY = useTransform(springX, [0, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(springY, [0, 1], [MAX_TILT, -MAX_TILT]);

  const primed = useRef(false);

  /**
   * Decode a frame or two up front. Without this the first hover spends its
   * opening moments spinning up the decoder, which is exactly where a delay is
   * most obvious. The clip opens on the folded-hands pose, identical to the
   * still, so priming is invisible.
   */
  const prime = useCallback(() => {
    setVideoReady(true);
    const video = videoRef.current;
    if (!video || primed.current) return;
    primed.current = true;
    void video
      .play()
      .then(() => {
        video.pause();
        video.currentTime = 0;
      })
      .catch(() => {
        /* Playback refused: hover will simply start it cold. */
      });
  }, []);

  const wave = useCallback(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    // Only seek when the clip has actually moved. Assigning currentTime = 0 on
    // an already-rewound video still triggers a seek, and that seek is a stall.
    if (video.currentTime > 0.05) video.currentTime = 0;
    void video.play().catch(() => {
      /* Playback refused, or no file: the still simply stays put. */
    });
  }, [reduceMotion]);

  /**
   * `canplay` is fired at the element, not replayed, so with preload="auto" and
   * a warm cache it can land before hydration attaches onCanPlay — and then the
   * video would sit invisible forever. Reconcile against readyState on attach.
   */
  const attachVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && node.readyState >= HAVE_FUTURE_DATA) prime();
    },
    [prime],
  );

  const rest = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

  const trackPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const box = event.currentTarget.getBoundingClientRect();
      pointerX.set((event.clientX - box.left) / box.width);
      pointerY.set((event.clientY - box.top) / box.height);
    },
    [pointerX, pointerY, reduceMotion],
  );

  const rise = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="border-b border-line">
      <motion.div
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
        className="mx-auto grid max-w-5xl gap-14 px-6 pb-24 pt-20 md:grid-cols-[1fr_minmax(0,0.85fr)] md:items-center md:gap-16 md:pt-28"
      >
        <div>
          <motion.p variants={rise} className="eyebrow">
            {site.employer} · {site.location}
          </motion.p>

          <motion.h1
            variants={rise}
            className="display mt-5 text-[clamp(2.75rem,7.5vw,4.75rem)]"
          >
            Sidhartha
            <br />
            Watsa
          </motion.h1>

          <motion.p variants={rise} className="prose-body mt-7 max-w-md">
            I work on making video smaller — next-generation codec standards in
            Samsung&rsquo;s AI Video Processing Lab. Before that, imitation
            learning at IISc Bangalore and autonomous systems at IIT Kanpur.
          </motion.p>
        </div>

        <motion.figure variants={rise}>
          <div
            className="[perspective:1100px]"
            onPointerMove={trackPointer}
            onPointerEnter={canHover ? wave : undefined}
            onPointerLeave={canHover ? rest : undefined}
          >
            <motion.div
              style={
                reduceMotion
                  ? undefined
                  : { rotateX, rotateY, transformStyle: "preserve-3d" }
              }
              className="portrait-frame relative aspect-[4/5] overflow-hidden"
            >
              <Image
                src="/media/portrait.jpg"
                alt={`${site.name}, ${site.role.toLowerCase()}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />

              <video
                ref={attachVideo}
                muted
                loop
                playsInline
                // Buffer the whole clip up front. It is ~450 KB, and the point
                // of the interaction is that hovering plays it with no wait.
                preload="auto"
                aria-hidden="true"
                onCanPlay={prime}
                onClick={canHover ? undefined : wave}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  videoReady ? "opacity-100" : "opacity-0"
                }`}
              >
                <source src="/media/hero-wave.webm" type="video/webm" />
                <source src="/media/hero-wave.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </div>

          <figcaption className="eyebrow mt-4">
            Fig. 1 — Myself
            {!reduceMotion && (
              <span className="text-muted/60">
                {canHover ? " · hover to wave" : " · tap to wave"}
              </span>
            )}
          </figcaption>
        </motion.figure>
      </motion.div>
    </section>
  );
}
