"use client";
export default function MotionControl(){
  function toggle(){const root=document.documentElement;const next=root.dataset.motion==="paused"?"playing":"paused";root.dataset.motion=next;try{localStorage.setItem("motion",next);}catch{/* Preference still applies for this visit. */}}
  return <button type="button" className="quiet-link motion-preference" onClick={toggle}><span className="motion-pause-label">Pause background</span><span className="motion-play-label">Play background</span></button>;
}
