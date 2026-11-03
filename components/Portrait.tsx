"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

export default function Portrait() {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { if (query.matches) video.current?.pause(); };
    query.addEventListener("change", stop);
    return () => query.removeEventListener("change", stop);
  }, []);
  function rest() {
    if (!video.current) return;
    video.current.pause();
    video.current.currentTime = 0;
  }
  function wave() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void video.current?.play().catch(() => {});
  }
  return <button type="button" className="identity-portrait" aria-label={`Wave hello to ${site.name}`} onPointerEnter={event => { if (event.pointerType === "mouse") wave(); }} onPointerLeave={rest} onClick={wave} onBlur={rest}>
    <Image src="/media/portrait.jpg" width={72} height={72} alt={site.name} priority />
    <video ref={video} muted playsInline aria-hidden="true" preload="none" onCanPlay={() => setReady(true)} className={ready ? "ready" : ""}>
      <source src="/media/hero-wave.webm" type="video/webm" /><source src="/media/hero-wave.mp4" type="video/mp4" />
    </video>
  </button>;
}
