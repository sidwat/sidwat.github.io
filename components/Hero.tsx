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
import Printed from "@/components/Printed";
import Typed from "@/components/Typed";
import { site } from "@/lib/site";

/**
 * Degrees of tilt at the edge of the frame. Small on purpose — the portrait
 * should read as a real person catching the light, not as a rotating card.
 */
const MAX_TILT = 6;

/**
 * The hero opens as a shell session. The commands are typed at human speed;
 * the output is printed, because that is what a shell does and because typing
 * a hundred and ninety characters at human speed would take half a minute.
 *
 * Every start is derived from the one before it, so retiming is a matter of
 * changing one number rather than recomputing the chain.
 */
const CMD_WHOAMI = "whoami";
const CMD_ABOUT = "cat about.txt";

const EYEBROW_TEXT = `${site.employer} \u00b7 ${site.location}`;
const NAME_TEXT = "Sidhartha Watsa";
const BODY_TEXT =
  "I work on making video smaller \u2014 next-generation codec standards in " +
  "Samsung\u2019s AI Video Processing Lab. Before that, imitation learning at " +
  "IISc Bangalore and autonomous systems at IIT Kanpur.";

/** Milliseconds per keystroke. Typed jitters this by ±35%. */
const TYPE_SPEED = 85;
/** The pause between pressing return and the output arriving. */
const RETURN_BEAT = 260;

const CMD1_AT = 420;
const NAME_AT = CMD1_AT + CMD_WHOAMI.length * TYPE_SPEED + RETURN_BEAT;
const EYEBROW_AT = NAME_AT + 130;
const CMD2_AT = EYEBROW_AT + 520;
const BODY_AT = CMD2_AT + CMD_ABOUT.length * TYPE_SPEED + RETURN_BEAT;
const IDLE_PROMPT_AT = BODY_AT + 420;

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
        {/* A shell session. The prompt lines are decoration, so they are hidden
            from assistive tech: what matters is the name, the role and the bio,
            all of which are in the DOM from the start. These carry their own
            entrance and take no part in the stagger the figure uses. */}
        <div>
          <p className="prompt" aria-hidden="true">
            <span className="prompt-sigil">$ </span>
            <Typed
              text={CMD_WHOAMI}
              speed={TYPE_SPEED}
              startDelay={CMD1_AT}
            />
          </p>

          <h1 className="display mt-4 text-[clamp(1.8rem,4.8vw,3.1rem)]">
            <Printed delay={NAME_AT}>{NAME_TEXT}</Printed>
          </h1>

          <p className="eyebrow mt-3">
            <Printed delay={EYEBROW_AT}>{EYEBROW_TEXT}</Printed>
          </p>

          {/* The sigil is revealed with the command, not at load: a shell does
              not show the next prompt until the last one has finished. */}
          <p className="prompt mt-9" aria-hidden="true">
            <Printed delay={CMD2_AT}>
              <span className="prompt-sigil">$ </span>
            </Printed>
            <Typed text={CMD_ABOUT} speed={TYPE_SPEED} startDelay={CMD2_AT} />
          </p>

          <p className="prose-body mt-4 max-w-md">
            <Printed delay={BODY_AT}>{BODY_TEXT}</Printed>
          </p>

          {/* The session comes to rest on an empty prompt, waiting. */}
          <p className="prompt mt-8" aria-hidden="true">
            <Printed delay={IDLE_PROMPT_AT}>
              <span className="prompt-sigil">$ </span>
              <span className="caret caret-blink" />
            </Printed>
          </p>
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
