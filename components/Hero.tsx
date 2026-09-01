"use client";

import { useCallback, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

// The canvas never renders on the server: static export has no WebGL context,
// and the figure is illustrative, so it loads after the words are legible.
const QuadtreeScene = dynamic(() => import("./QuadtreeScene"), { ssr: false });

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
  const compact = useMediaQuery("(max-width: 767px)");

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
        className="mx-auto grid max-w-5xl gap-14 px-6 pb-24 pt-20 md:grid-cols-[1fr_minmax(0,1.05fr)] md:items-center md:gap-16 md:pt-28"
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

        {/* Presented as a plate, the way a paper presents one: the figure is
            the argument, and it earns a caption rather than sitting behind the
            words as decoration. */}
        <motion.figure variants={rise} className="md:mt-2">
          <div className="relative aspect-video overflow-hidden border border-line bg-surface">
            <QuadtreeScene
              maxDepth={compact ? 5 : 6}
              animate={!reduceMotion}
            />
          </div>
          <figcaption className="eyebrow mt-4 !leading-relaxed">
            Fig. 1 — Quadtree partition of a frame. Blocks stay large where the
            image is flat and split where it has structure.
          </figcaption>
        </motion.figure>
      </motion.div>
    </section>
  );
}
